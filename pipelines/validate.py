"""Validation gates: schema/CRS/geometry/freshness/licence. Any failure quarantines."""

from __future__ import annotations

import json
import struct
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from .download import PipelineError

LEEDS_BOUNDS = (-1.80, 53.65, -1.28, 54.02)  # from config: [minLon, minLat, maxLon, maxLat]


@dataclass
class ValidationIssue:
    check: str
    passed: bool
    detail: str


@dataclass
class ValidationResult:
    source_id: str
    version_id: str
    issues: list[ValidationIssue] = field(default_factory=list)
    quarantined: bool = False
    reason: str | None = None

    @property
    def passed(self) -> bool:
        return all(issue.passed for issue in self.issues)

    def to_json(self) -> dict[str, object]:
        return {
            "source_id": self.source_id,
            "version_id": self.version_id,
            "passed": self.passed,
            "quarantined": self.quarantined,
            "reason": self.reason,
            "issues": [
                {"check": i.check, "passed": i.passed, "detail": i.detail} for i in self.issues
            ],
        }


def _record(result: ValidationResult, check: str, passed: bool, detail: str) -> None:
    result.issues.append(ValidationIssue(check=check, passed=passed, detail=detail))


def validate_osm_pbf(payload: Path, result: ValidationResult) -> None:
    """Structural checks for an OSM PBF without heavy dependencies.

    A PBF starts with a 4-byte big-endian length N of the first protobuf blob
    header, whose `type` field is the string "OSMHeader" (postprocessed PBFs
    may also carry "OSMData" first). We check that structure, not an ASCII tag.
    """
    detail = "unexpected structure"
    passed = False
    try:
        with payload.open("rb") as handle:
            prefix = handle.read(4)
            (blob_len,) = struct.unpack(">I", prefix)
            if 0 < blob_len <= 65536:
                blob_header = handle.read(blob_len)
                detail = f"blob header len {blob_len}: {blob_header[:32]!r}"
                passed = b"OSMHeader" in blob_header
    except (OSError, struct.error) as exc:
        detail = f"unreadable: {exc}"
    _record(result, "osm_pbf_header", passed, detail)


def validate_geojson(payload: Path, result: ValidationResult, *, expected_crs: str = "OGC:CRS84") -> None:
    """Validate a GeoJSON boundary/point file: parse, bbox, and declared CRS."""
    try:
        doc = json.loads(payload.read_text())
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        _record(result, "geojson_parse", False, f"not valid JSON: {exc}")
        return
    _record(result, "geojson_parse", True, "parsed")
    crs = doc.get("crs")
    if crs is None:
        _record(result, "crs_declared", True, f"no crs member; RFC 7946 default {expected_crs} assumed")
    else:
        _record(result, "crs_declared", True, str(crs))

    features = doc.get("features")
    if not isinstance(features, list) or not features:
        _record(result, "geometry_present", False, "no features")
        return

    bad_geometry = sum(1 for f in features if not isinstance(f.get("geometry"), dict))
    _record(result, "geometry_present", bad_geometry == 0, f"{bad_geometry}/{len(features)} features lack geometry")

    xs: list[float] = []
    ys: list[float] = []
    for feature in features:
        geometry = feature.get("geometry")
        if not isinstance(geometry, dict):
            continue
        coords = geometry.get("coordinates")
        flat: list[tuple[float, float]] = []

        def walk(node: object) -> None:
            if isinstance(node, (list, tuple)) and node and isinstance(node[0], (int, float)):
                flat.append((float(node[0]), float(node[1])))  # type: ignore[arg-type]
            elif isinstance(node, (list, tuple)):
                for child in node:
                    walk(child)

        walk(coords)
        xs.extend(x for x, _ in flat)
        ys.extend(y for _, y in flat)

    if not xs or not ys:
        _record(result, "bbox_leeds", False, "no coordinates found")
        return
    bbox = (min(xs), min(ys), max(xs), max(ys))
    inside = (
        bbox[0] >= LEEDS_BOUNDS[0] - 1.0
        and bbox[1] >= LEEDS_BOUNDS[1] - 1.0
        and bbox[2] <= LEEDS_BOUNDS[2] + 1.0
        and bbox[3] <= LEEDS_BOUNDS[3] + 1.0
    )
    _record(
        result,
        "bbox_leeds",
        inside,
        f"dataset bbox {bbox} vs Leeds bounds {LEEDS_BOUNDS}",
    )


def validate_freshness(retrieval: dict[str, object], result: ValidationResult, *, max_age_days: int | None) -> None:
    if max_age_days is None:
        _record(result, "freshness", True, "no freshness rule configured")
        return
    retrieved_at = str(retrieval.get("retrieved_at", ""))
    try:
        retrieved = datetime.strptime(retrieved_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        _record(result, "freshness", False, f"unreadable retrieval timestamp: {retrieved_at!r}")
        return
    age = (datetime.now(timezone.utc) - retrieved).days
    _record(result, "freshness", age <= max_age_days, f"retrieved {age} days ago (limit {max_age_days})")


def validate_licence(licence: str | None, result: ValidationResult, *, admissible: set[str]) -> None:
    if not licence:
        _record(result, "licence", False, "no licence recorded for source")
        return
    _record(
        result,
        "licence",
        licence in admissible,
        f"licence {licence}; admissible: {sorted(admissible)}",
    )
