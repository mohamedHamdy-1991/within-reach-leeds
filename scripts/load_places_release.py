#!/usr/bin/env python
"""Load places from the released OSM extract into PostGIS.

Category mapping is defined in city config terms but kept conservative:
only well-evidenced OSM tags become places; everything else stays unknown
and is simply not loaded (unknown never becomes accessible).
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

import osmium
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipelines.download import sha256_file  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RELEASE_ID = "osm-west-yorkshire-2026-09-05-candidate"
RELEASE_DIR = ROOT / "data" / "releases" / RELEASE_ID
LEEDS_BBOX = (-1.80, 53.65, -1.28, 54.02)

# OSM tag -> (category, kind). Deliberately narrow for V1 evidence quality.
TAG_MAP = {
    ("amenity", "toilets"): ("essentials", "Toilet"),
    ("amenity", "pharmacy"): ("essentials", "Pharmacy"),
    ("amenity", "library"): ("community", "Community hub"),
    ("amenity", "community_centre"): ("community", "Community hub"),
    ("amenity", "place_of_worship"): ("community", "Place of worship"),
    ("leisure", "park"): ("wellbeing", "Park"),
    ("leisure", "playground"): ("wellbeing", "Playground"),
    ("amenity", "cafe"): ("wellbeing", "Café"),
    ("amenity", "bench"): ("wellbeing", "Seat"),
    ("amenity", "drinking_water"): ("wellbeing", "Drinking water"),
    ("amenity", "police"): ("support", "Police"),
    ("amenity", "hospital"): ("support", "Hospital"),
    ("amenity", "doctors"): ("support", "Health"),
    ("amenity", "social_facility"): ("support", "Social facility"),
}


class PlaceCollector(osmium.SimpleHandler):
    def __init__(self) -> None:
        super().__init__()
        self.places: list[tuple[str, str, str, str, float, float]] = []

    def _consider(self, osm_id: str, name: str | None, tags: osmium.TagList, lon: float, lat: float) -> None:
        if not name or not (LEEDS_BBOX[0] <= lon <= LEEDS_BBOX[2] and LEEDS_BBOX[1] <= lat <= LEEDS_BBOX[3]):
            return
        for key, value in TAG_MAP.items():
            if tags.get(key[0]) == key[1]:
                category, kind = value
                self.places.append((osm_id, name, category, kind, lat, lon))
                return

    def node(self, n: osmium.Node) -> None:
        self._consider(f"node/{n.id}", n.tags.get("name"), n.tags, n.location.lon, n.location.lat)


async def main() -> int:
    payload = RELEASE_DIR / "osm__west-yorkshire-2026-09-05__payload"
    if not payload.exists():
        print(f"missing release payload: {payload}")
        return 2
    manifest = json.loads((RELEASE_DIR / "RELEASE_MANIFEST.json").read_text())
    sha = manifest["created_entries"][0]["sha256_verified"]
    if sha != sha256_file(payload):
        print("release checksum mismatch — refusing to load")
        return 3

    # osmium detects the format by filename suffix; release payloads are suffix-less.
    read_path = ROOT / ".runtime" / "tmp" / "release-read.osm.pbf"
    read_path.parent.mkdir(parents=True, exist_ok=True)
    if not read_path.exists() or read_path.resolve() != payload.resolve():
        if read_path.exists() or read_path.is_symlink():
            read_path.unlink()
        read_path.symlink_to(payload)

    collector = PlaceCollector()
    collector.apply_file(str(read_path), locations=True)

    engine = create_async_engine("postgresql+asyncpg://wr:wr_local_dev_only@127.0.0.1:5432/withinreach")
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "INSERT INTO wr.releases (release_id, manifest) VALUES (:rid, CAST(:manifest AS jsonb)) "
                "ON CONFLICT (release_id) DO NOTHING"
            ),
            {"rid": RELEASE_ID, "manifest": json.dumps(manifest)},
        )
        inserted = 0
        batch: list[dict[str, object]] = []
        for osm_id, name, category, kind, lat, lon in collector.places:
            batch.append(
                {
                    "rid": RELEASE_ID,
                    "ext": osm_id,
                    "name": name,
                    "category": category,
                    "kind": kind,
                    "lon": lon,
                    "lat": lat,
                }
            )
        if batch:
            await conn.execute(
                text(
                    "INSERT INTO wr.places (release_id, external_id, name, category, kind, geom, confidence, source_id, retrieved_at) "
                    "SELECT :rid, :ext, :name, :category, :kind, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 'mapped', 'osm', to_char(now(), 'YYYY-MM') "
                    "ON CONFLICT (release_id, external_id) DO NOTHING"
                ),
                batch,
            )
            inserted = len(batch)
        # Geocode index: named features only, same release.
        await conn.execute(
            text(
                "INSERT INTO wr.geocode_index (release_id, name, kind, geom) "
                "SELECT release_id, name, kind, geom FROM wr.places WHERE release_id = :rid "
                "ON CONFLICT DO NOTHING"
            ),
            {"rid": RELEASE_ID},
        )
    counts = await (await engine.connect()).execute(
        text("SELECT category, count(*) FROM wr.places WHERE release_id = :rid GROUP BY category"),
        {"rid": RELEASE_ID},
    )
    summary = {row[0]: row[1] for row in counts}
    await engine.dispose()
    print(json.dumps({"inserted": inserted, "by_category": summary}))
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
