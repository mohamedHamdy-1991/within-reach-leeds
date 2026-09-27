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
    counts = await fetch_all(
        "SELECT category, count(*) AS n FROM wr.places GROUP BY category",
    )
    releases = await fetch_all("SELECT string_agg(release_id, ', ' ORDER BY created_at) AS ids FROM wr.releases")
    manifest = row[0]["manifest"]
    sources = (
        manifest.get("created_entries", [])
        if isinstance(manifest, dict)
        else json.loads(str(manifest)).get("created_entries", [])
    )
    return {
        "mode": "release-candidate",
        "dataReleaseId": releases[0]["ids"] if releases else None,
        "message": "Candidate data release loaded. Accessibility fields are mapped, not verified.",
        "sources": sources,
        "placeCounts": {c["category"]: c["n"] for c in counts},
    }


async def places(latitude: float, longitude: float, category: str | None, limit: int, kind: str | None = None) -> dict[str, Any]:
    rows = await fetch_all(
        """
        SELECT external_id, name, category, kind, release_id, attrs,
               ST_Y(geom) AS latitude, ST_X(geom) AS longitude,
               confidence, source_id, retrieved_at,
               ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) AS metres
        FROM wr.places
        WHERE (CAST(:category AS text) IS NULL OR category = CAST(:category AS text))
          AND (CAST(:kind AS text) IS NULL OR kind = CAST(:kind AS text))
          AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radius)
        ORDER BY metres ASC
        LIMIT :limit
        """,
        {"lon": longitude, "lat": latitude, "category": category, "kind": kind, "limit": limit, "radius": 2000},
    )
    releases = await fetch_all("SELECT string_agg(release_id, ', ' ORDER BY created_at) AS ids FROM wr.releases")
    return {
        "dataReleaseId": releases[0]["ids"] if releases else None,
        "note": "Distances are straight-line until route costs are wired (Phase 5). Accessibility fields are mapped, not verified.",
        "places": [
            {k: (float(v) if k in ("latitude", "longitude", "metres") else v) for k, v in dict(r).items()}
            for r in rows
        ],
    }


async def geocode(q: str, limit: int) -> dict[str, Any]:
    """Google-Maps-style ranking: prefix matches first, then word-prefix,
    then substring, then fuzzy trigram. Best hint is always the first row."""
    rows = await fetch_all(
        """
        SELECT name, kind, ST_Y(geom) AS latitude, ST_X(geom) AS longitude,
               CASE
                 WHEN replace(upper(name), ' ', '') = replace(upper(:q), ' ', '')  THEN 0
                 WHEN replace(upper(name), ' ', '') LIKE replace(upper(:q), ' ', '') || '%' THEN 1
                 WHEN replace(upper(name), ' ', '') LIKE left(replace(upper(:q), ' ', ''), 4) || '%' THEN 2
                 WHEN lower(name) = lower(:q)                        THEN 2
                 WHEN lower(name) LIKE lower(:q) || '%'              THEN 3
                 WHEN lower(name) LIKE '% ' || lower(:q) || '%'      THEN 4
                 ELSE 5
               END AS rank
        FROM wr.geocode_index
        WHERE name % :q
           OR lower(name) LIKE '%' || lower(:q) || '%'
           OR replace(upper(name), ' ', '') LIKE '%' || replace(upper(:q), ' ', '') || '%'
           OR replace(upper(name), ' ', '') LIKE left(replace(upper(:q), ' ', ''), 4) || '%'
        ORDER BY rank ASC, similarity(name, :q) DESC, length(name) ASC
        LIMIT :limit
        """,
        {"q": q, "limit": limit},
    )
    results = []
    for row in rows:
        item = dict(row)
        item.pop("rank", None)
        results.append(item)
    # Bounded by construction: geocode_index only contains in-bounds release features.
    return {"results": results, "boundedTo": "leeds-release-index"}
