#!/usr/bin/env python
"""Load the ACCEPTED-STALE Data Mill North release into PostGIS.

D-SRC-01 (2026-09-05): Mohamed approved using existing Data Mill North data
for now. Every place records the dataset date and the accepted-stale flag so
the UI can show the age honestly.
"""
from __future__ import annotations

import asyncio
import csv
import io
import json
import sys
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

ROOT = Path(__file__).resolve().parent.parent
RELEASE_DIR = ROOT / "data/releases/dmn-accepted-stale-2026-09-05"
RELEASE_ID = "dmn-accepted-stale-2026-09-05"
STALE_ATTRS = {"accepted_stale": True, "publisher_dataset_date": "2019-02"}


def rows(name: str) -> list[dict[str, str]]:
    text_data = (RELEASE_DIR / name).read_text(encoding="cp1252")
    reader = csv.DictReader(io.StringIO(text_data))
    return [{(k or "").strip(): v for k, v in row.items()} for row in reader]


async def main() -> int:
    engine = create_async_engine("postgresql+asyncpg://wr:wr_local_dev_only@127.0.0.1:5433/withinreach")
    counts: dict[str, int] = {}
    async with engine.begin() as conn:
        await conn.execute(
            text("INSERT INTO wr.releases (release_id, manifest) VALUES (:rid, CAST(:m AS jsonb)) ON CONFLICT (release_id) DO NOTHING"),
            {"rid": RELEASE_ID, "m": json.dumps({"note": "ACCEPTED-STALE under author decision D-SRC-01 (2026-09-05)"})},
        )

        # Crossings (GeoJSON, 666 controlled/push-button sites)
        crossings = json.loads((RELEASE_DIR / "leeds_crossings__crossings-2026-09-05__payload").read_text())
        batch = []
        for index, feature in enumerate(crossings["features"]):
            lon, lat = feature["geometry"]["coordinates"]
            props = feature["properties"]
            batch.append({
                "ext": f"crossing/{index}",
                "name": props.get("Address") or "Crossing site",
                "lon": lon, "lat": lat,
                "kind": "Crossing",
                "attrs": json.dumps({**STALE_ATTRS, "installation_type": props.get("Installation_Type"), "ward": props.get("Ward")}),
            })
        if batch:
            await conn.execute(text(
                "INSERT INTO wr.places (release_id, external_id, name, category, kind, geom, confidence, source_id, retrieved_at, attrs) "
                "SELECT :rid, :ext, :name, 'support', :kind, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 'verified', 'leeds_crossings', '2019-02 (stale, accepted)', CAST(:attrs AS jsonb) "
                "ON CONFLICT (release_id, external_id) DO NOTHING"
            ), [b | {"rid": RELEASE_ID} for b in batch])
        counts["crossings"] = len(batch)

        # Safe Places (201 rows with lat/lon)
        batch = []
        for index, row in enumerate(rows("leeds_safe_places__safe-places-2026-09-05__payload")):
            try:
                lat, lon = float(row["Latitude"]), float(row["Longitude"])
            except (ValueError, KeyError):
                continue
            batch.append({
                "ext": f"safe-place/{index}",
                "name": row["Location"].strip(),
                "lon": lon, "lat": lat,
                "kind": "Safe Place",
                "attrs": json.dumps({**STALE_ATTRS, "address": ", ".join(filter(None, [row.get("Address 1"), row.get("Address 2"), row.get("City"), row.get("Post Code")]))}),
            })
        if batch:
            await conn.execute(text(
                "INSERT INTO wr.places (release_id, external_id, name, category, kind, geom, confidence, source_id, retrieved_at, attrs) "
                "SELECT :rid, :ext, :name, 'support', :kind, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 'verified', 'leeds_safe_places', '2019-02 (stale, accepted)', CAST(:attrs AS jsonb) "
                "ON CONFLICT (release_id, external_id) DO NOTHING"
            ), [b | {"rid": RELEASE_ID} for b in batch])
        counts["safe_places"] = len(batch)

        # Changing Places (33 rows with easting/northing)
        from pyproj import Transformer

        tr = Transformer.from_crs(27700, 4326, always_xy=True)
        batch = []
        for index, row in enumerate(rows("leeds_changing_places__changing-places-2026-09-05__payload")):
            try:
                lon, lat = tr.transform(float(row["EASTING"]), float(row["NORTHING"]))
            except (ValueError, KeyError):
                continue
            batch.append({
                "ext": f"changing-places/{index}",
                "name": row["Location"].strip(),
                "lon": lon, "lat": lat,
                "kind": "Changing Places toilet",
                "attrs": json.dumps({**STALE_ATTRS, "phone": row.get("Telephone"), "website": row.get("Website"), "postcode": row.get("Postcode with space")}),
            })
        if batch:
            await conn.execute(text(
                "INSERT INTO wr.places (release_id, external_id, name, category, kind, geom, confidence, source_id, retrieved_at, attrs) "
                "SELECT :rid, :ext, :name, 'essentials', :kind, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 'verified', 'leeds_changing_places', '2019-02 (stale, accepted)', CAST(:attrs AS jsonb) "
                "ON CONFLICT (release_id, external_id) DO NOTHING"
            ), [b | {"rid": RELEASE_ID} for b in batch])
        counts["changing_places"] = len(batch)

        # Geocode index
        await conn.execute(text(
            "INSERT INTO wr.geocode_index (release_id, name, kind, geom) "
            "SELECT release_id, name, kind, geom FROM wr.places WHERE release_id = :rid ON CONFLICT DO NOTHING"
        ), {"rid": RELEASE_ID})

    print(json.dumps(counts))
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
