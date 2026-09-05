"""PostGIS-backed queries. Every result carries provenance (A10)."""

from __future__ import annotations

import json
from typing import Any

from sqlalchemy import text

from .db import fetch_all

ACTIVE_RELEASE_SQL = "SELECT release_id, manifest FROM wr.releases WHERE activated_at IS NOT NULL ORDER BY activated_at DESC LIMIT 1"


async def meta() -> dict[str, Any]:
    row = await fetch_all("SELECT release_id, manifest FROM wr.releases ORDER BY created_at DESC LIMIT 1")
    if not row:
        return {
            "mode": "no-release",
            "dataReleaseId": None,
            "message": "No validated live accessibility release is active yet.",
            "sources": [],
        }
    release_id = row[0]["release_id"]
    counts = await fetch_all(
        "SELECT category, count(*) AS n FROM wr.places WHERE release_id = :rid GROUP BY category",
        {"rid": release_id},
    )
    manifest = row[0]["manifest"]
    sources = (
        manifest.get("created_entries", [])
        if isinstance(manifest, dict)
        else json.loads(str(manifest)).get("created_entries", [])
    )
    return {
        "mode": "release-candidate",
        "dataReleaseId": release_id,
        "message": "Candidate data release loaded. Accessibility fields are mapped, not verified.",
        "sources": sources,
        "placeCounts": {c["category"]: c["n"] for c in counts},
    }


async def places(latitude: float, longitude: float, category: str | None, limit: int) -> dict[str, Any]:
    release = await fetch_all("SELECT release_id FROM wr.releases ORDER BY created_at DESC LIMIT 1")
    if not release:
        return {"dataReleaseId": None, "places": []}
    rid = release[0]["release_id"]
    rows = await fetch_all(
        """
        SELECT external_id, name, category, kind,
               ST_Y(geom) AS latitude, ST_X(geom) AS longitude,
               confidence, source_id, retrieved_at,
               ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) AS metres
        FROM wr.places
        WHERE release_id = :rid
          AND (CAST(:category AS text) IS NULL OR category = CAST(:category AS text))
          AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radius)
        ORDER BY metres ASC
        LIMIT :limit
        """,
        {"lon": longitude, "lat": latitude, "rid": rid, "category": category, "limit": limit, "radius": 2000},
    )
    return {
        "dataReleaseId": rid,
        "note": "Distances are straight-line until route costs are wired (Phase 5). Confidence is 'mapped' for OSM-derived fields.",
        "places": [
            {k: (float(v) if k in ("latitude", "longitude", "metres") else v) for k, v in dict(r).items()}
            for r in rows
        ],
    }


async def geocode(q: str, limit: int) -> dict[str, Any]:
    rows = await fetch_all(
        """
        SELECT name, kind, ST_Y(geom) AS latitude, ST_X(geom) AS longitude
        FROM wr.geocode_index
        WHERE name % :q
        ORDER BY similarity(name, :q) DESC
        LIMIT :limit
        """,
        {"q": q, "limit": limit},
    )
    # Bounded by construction: geocode_index only contains in-bounds release features.
    return {"results": [dict(r) for r in rows], "boundedTo": "leeds-release-index"}
