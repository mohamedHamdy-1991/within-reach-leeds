"""Static-bundle data backend for the hosted deployment.

Loads the exported places bundle (see scripts export) into memory and serves
places/meta/geocode without Postgres. Same contract, same honesty rules:
every row carries its source, retrieval date and confidence verbatim from
the validated releases. 12.5k rows → trivial memory footprint.
"""

from __future__ import annotations

import gzip
import json
import os
import re
from difflib import SequenceMatcher
from typing import Any

_BUNDLE_PATH = os.environ.get("PLACES_BUNDLE", "/app/api/places-bundle.json.gz")

_places: list[dict[str, Any]] = []
_postcodes: list[dict[str, Any]] = []
_releases: list[str] = []


def load_bundle() -> None:
    global _places, _postcodes, _releases
    opener = gzip.open if _BUNDLE_PATH.endswith(".gz") else open
    with opener(_BUNDLE_PATH, "rt", encoding="utf-8") as handle:  # type: ignore[operator]
        data = json.load(handle)
    _places = data["places"]
    _postcodes = data.get("postcodeIndex", [])
    _releases = data.get("releases", [])


async def meta() -> dict[str, Any]:
    counts: dict[str, int] = {}
    for place in _places:
        counts[place["category"]] = counts.get(place["category"], 0) + 1
    return {
        "mode": "release-candidate",
        "dataReleaseId": ", ".join(_releases),
        "message": "Hosted data bundle loaded from the validated releases. Accessibility fields are mapped, not verified.",
        "sources": [],
        "placeCounts": counts,
    }


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import asin, cos, radians, sin, sqrt

    p1, p2 = radians(lat1), radians(lat2)
    dp = p2 - p1
    dl = radians(lon2 - lon1)
    a = sin(dp / 2) ** 2 + cos(p1) * cos(p2) * sin(dl / 2) ** 2
    return 6371000 * 2 * asin(a ** 0.5)


async def places(latitude: float, longitude: float, category: str | None, limit: int, kind: str | None = None) -> dict[str, Any]:
    scored = []
    for place in _places:
        if category and place["category"] != category:
            continue
        if kind and place["kind"] != kind:
            continue
        metres = _haversine(latitude, longitude, place["latitude"], place["longitude"])
        if metres <= 2000:
            scored.append((metres, place))
    scored.sort(key=lambda pair: pair[0])
    rows = []
    for metres, place in scored[:limit]:
        row = {k: v for k, v in place.items() if k != "attrs"}
        row["metres"] = round(metres, 1)
        rows.append(row)
    return {
        "dataReleaseId": ", ".join(_releases),
        "note": "Distances are straight-line. Accessibility fields are mapped, not verified.",
        "places": rows,
    }


async def geocode(q: str, limit: int) -> dict[str, Any]:
    query = q.strip()
    if not query:
        return {"results": [], "boundedTo": "leeds-release-index"}
    compact_q = re.sub(r"\s+", "", query.upper())
    district_q = compact_q[:4]

    def rank(name: str) -> int:
        compact_n = re.sub(r"\s+", "", name.upper())
        if compact_n == compact_q:
            return 0
        if compact_n.startswith(compact_q):
            return 1
        if district_q and compact_n.startswith(district_q):
            return 2
        lowered = name.lower()
        lq = query.lower()
        if lowered == lq:
            return 2
        if lowered.startswith(lq):
            return 3
        if f" {lq}" in lowered:
            return 4
        return 5

    candidates: list[tuple[int, float, int, dict[str, Any]]] = []
    for entry in _places + _postcodes:  # type: ignore[operator]
        score = rank(entry["name"])
        fuzzy = SequenceMatcher(None, entry["name"].lower(), query.lower()).ratio()
        if score >= 5 and fuzzy < 0.55:
            continue
        candidates.append((score, -fuzzy, len(entry["name"]), entry))
    candidates.sort(key=lambda item: (item[0], item[1], item[2]))
    results = [
        {"name": entry["name"], "kind": entry.get("kind", ""), "latitude": entry["latitude"], "longitude": entry["longitude"]}
        for _, _, _, entry in candidates[:limit]
    ]
    return {"results": results, "boundedTo": "leeds-release-index"}
