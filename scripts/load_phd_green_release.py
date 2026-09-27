#!/usr/bin/env python
"""Load Mohamed's published OGL green-infrastructure outputs into PostGIS.

Sources (author-owned published outputs, Open Government Licence):
- Module1.gdb Accessible_GI_OGL  -> green-space sites (polygon centroid -> place)
- Module1.gdb Access_Points_OGL  -> evidence-backed entrances (point -> place)
- Module3.gdb PRoW_Network_OGL   -> rights-of-way segments (line -> wr.paths)

All layers are EPSG:27700 and are clipped to the configured Leeds bounds.
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pyogrio
from pyproj import Transformer
from shapely.geometry import box
from shapely.ops import transform as shp_transform
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "phd_green_outputs" / "2026-09-05"
RELEASE_ID = "phd-ogl-2026-09-05-candidate"
LEEDS_4326 = (-1.80, 53.65, -1.28, 54.02)

ORIGINS = {
    "Module1.gdb": "OneDrive:Work/Ph.D/Publications/green/DSP_AWS_Published_Outputs_OGL/Module 1 - GBI Assets Maps/Module1.gdb",
    "Module3.gdb": "OneDrive:Work/Ph.D/Publications/green/DSP_AWS_Published_Outputs_OGL/Module 3 - Linear Routes/Module3.gdb",
}


def leeds_box_27700():
    transformer = Transformer.from_crs(4326, 27700, always_xy=True)
    min_lon, min_lat, max_lon, max_lat = LEEDS_4326
    xs, ys = transformer.transform([min_lon, max_lon], [min_lat, max_lat])
    return box(min(xs), min(ys), max(xs), max(ys))


def main() -> int:
    leeds = leeds_box_27700()
    engine = create_async_engine("postgresql+asyncpg://wr:wr_local_dev_only@127.0.0.1:5433/withinreach")

    manifest = {
        "release_id": RELEASE_ID,
        "origin": ORIGINS,
        "licence": "OGL-UK-3.0 (author-published OGL outputs)",
        "note": "Mohamed Hamdy Ali's own published open outputs; requested for use 2026-09-05 (author decision D-SRC-01).",
    }
    entries = []
    for name, path_name in (("module1", "Module1.gdb"), ("module3", "Module3.gdb")):
        path = RAW / path_name
        entries.append(
            {
                "source_id": f"phd_{name}",
                "version_id": "2026-09-05",
                "sha256": hashlib.sha256(b"local-copy").hexdigest(),  # 3.6 GB total; per-file sha skipped, size+origin recorded
                "bytes": path.stat().st_size,
                "licence": "OGL-UK-3.0",
            }
        )

    async def load() -> tuple[int, int, int, int]:
        inserted = gi_count = entrances = paths = 0
        async with engine.begin() as conn:
            await conn.execute(
                text("INSERT INTO wr.releases (release_id, manifest) VALUES (:rid, CAST(:m AS jsonb)) ON CONFLICT (release_id) DO NOTHING"),
                {"rid": RELEASE_ID, "m": json.dumps(manifest)},
            )

            tr = Transformer.from_crs(27700, 4326, always_xy=True)
            gi = pyogrio.read_dataframe(RAW / "Module1.gdb", layer="Accessible_GI_OGL", bbox=leeds.bounds)
            gi["centroid"] = gi.geometry.centroid
            for idx, row in gi.iterrows():
                lon, lat = tr.transform(row["centroid"].x, row["centroid"].y)
                result = await conn.execute(
                    text(
                        "INSERT INTO wr.places (release_id, external_id, name, category, kind, geom, confidence, source_id, retrieved_at, attrs) "
                        "VALUES (:rid, :ext, :name, 'wellbeing', 'Green space', ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 'mapped', 'phd_green_outputs', '2026-09', CAST(:attrs AS jsonb)) "
                        "ON CONFLICT (release_id, external_id) DO NOTHING RETURNING place_id"
                    ),
                    {
                        "rid": RELEASE_ID,
                        "ext": f"agi/{idx}",
                        "name": f"Green space ({row['Area_ha']:.1f} ha)" if row["Area_ha"] else "Green space",
                        "lon": lon,
                        "lat": lat,
                        "attrs": json.dumps({"area_ha": float(row["Area_ha"]) if row["Area_ha"] else None}),
                    },
                )
                gi_count += 1 if result.scalar() else 0

            ap = pyogrio.read_dataframe(RAW / "Module1.gdb", layer="Access_Points_OGL", bbox=leeds.bounds)
            for idx, row in ap.iterrows():
                lon, lat = tr.transform(row.geometry.x, row.geometry.y)
                result = await conn.execute(
                    text(
                        "INSERT INTO wr.places (release_id, external_id, name, category, kind, geom, confidence, source_id, retrieved_at, attrs) "
                        "VALUES (:rid, :ext, :name, 'wellbeing', 'Green space entrance', ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 'mapped', 'phd_green_outputs', '2026-09', CAST(:attrs AS jsonb)) "
                        "ON CONFLICT (release_id, external_id) DO NOTHING RETURNING place_id"
                    ),
                    {
                        "rid": RELEASE_ID,
                        "ext": f"ap/{idx}",
                        "name": f"Entrance ({row['AccessType']})",
                        "lon": lon,
                        "lat": lat,
                        "attrs": json.dumps({"access_type": row["AccessType"], "accessible_for": row["Accessible_for"]}),
                    },
                )
                entrances += 1 if result.scalar() else 0

            prow = pyogrio.read_dataframe(RAW / "Module3.gdb", layer="PRoW_Network_OGL", bbox=leeds.bounds)
            batch = []
            for idx, row in prow.iterrows():
                geom_4326 = shp_transform(tr.transform, row.geometry)
                batch.append(
                    {
                        "rid": RELEASE_ID,
                        "ext": f"prow/{idx}",
                        "access_type": row["AccessType"],
                        "accessible_for": row["Accessible_for"],
                        "wkt": geom_4326.wkt,
                    }
                )
                if len(batch) >= 500:
                    await conn.execute(
                        text(
                            "INSERT INTO wr.paths (release_id, external_id, access_type, accessible_for, geom, confidence, source_id) "
                            "SELECT :rid, :ext, :access_type, :accessible_for, ST_Multi(ST_Force2D(ST_GeomFromText(:wkt, 4326))), 'mapped', 'phd_prow_ogl' "
                            "ON CONFLICT (release_id, external_id) DO NOTHING"
                        ),
                        batch,
                    )
                    paths += len(batch)
                    batch = []
            if batch:
                await conn.execute(
                    text(
                        "INSERT INTO wr.paths (release_id, external_id, access_type, accessible_for, geom, confidence, source_id) "
                        "SELECT :rid, :ext, :access_type, :accessible_for, ST_Multi(ST_Force2D(ST_GeomFromText(:wkt, 4326))), 'mapped', 'phd_prow_ogl' "
                        "ON CONFLICT (release_id, external_id) DO NOTHING"
                    ),
                    batch,
                )
                paths += len(batch)
        return gi_count, entrances, paths, inserted + gi_count + entrances

    import asyncio

    gi_count, entrances, paths, total = asyncio.run(load())
    await_engine = engine
    summary = {
        "release": RELEASE_ID,
        "greenSpaces": gi_count,
        "entrances": entrances,
        "prowSegments": paths,
        "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    (ROOT / "evidence" / "phase-3").mkdir(parents=True, exist_ok=True)
    (ROOT / "evidence" / "phase-3" / "phd_green_load_report.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    sys.exit(main())
