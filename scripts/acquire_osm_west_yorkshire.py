#!/usr/bin/env python
"""Acquire the OSM West Yorkshire extract through the immutable pipeline.

Run from the project root with the project venv. Demonstrates the Phase 3
gates end-to-end on a real source: checksum, structural validation, freshness
and licence gates; quarantine or release publication accordingly.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipelines.download import PipelineError, download_immutable, sha256_file
from pipelines.publish import publish_release, quarantine
from pipelines.validate import ValidationResult, validate_freshness, validate_osm_pbf

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
QUARANTINE = ROOT / "data" / "quarantine"
RELEASES = ROOT / "data" / "releases"
BASE = "https://download.geofabrik.de/europe/united-kingdom/england/west-yorkshire-latest.osm.pbf"
SOURCE = "osm"
VERSION = "west-yorkshire-2026-09-05"


def main() -> int:
    md5_path = ROOT / ".runtime" / "tmp" / "wy.md5"
    md5_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["curl", "-sSL", f"{BASE}.md5", "-o", str(md5_path)],
        check=True,
        timeout=120,
    )
    expected_md5 = md5_path.read_text().split()[0].strip()

    try:
        payload, record = download_immutable(BASE, RAW, SOURCE, VERSION)
    except PipelineError as exc:
        print(f"DOWNLOAD_FAIL: {exc}")
        return 2

    import hashlib

    md5_digest = hashlib.md5()
    with payload.open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            md5_digest.update(chunk)
    actual_md5 = md5_digest.hexdigest()
    md5_ok = actual_md5 == expected_md5

    result = ValidationResult(source_id=SOURCE, version_id=VERSION)
    validate_osm_pbf(payload, result)
    validate_freshness(record.to_json(), result, max_age_days=14)
    from pipelines.validate import validate_licence

    validate_licence("ODbL-1.0", result, admissible={"ODbL-1.0", "OGL-UK-3.0"})

    # The publisher's md5 is an independent integrity gate alongside our sha256.
    result.issues.append(
        type(result.issues[0])(
            check="publisher_md5", passed=md5_ok, detail=f"expected {expected_md5}, actual {actual_md5}"
        )
    )

    report = {
        "sha256": record.sha256,
        "bytes": record.bytes,
        "retrieval": record.to_json(),
        "validation": result.to_json(),
    }
    (ROOT / "evidence" / "phase-3").mkdir(parents=True, exist_ok=True)
    (ROOT / "evidence" / "phase-3" / "osm_acquisition_report.json").write_text(
        json.dumps(report, indent=2) + "\n"
    )

    if not result.passed:
        result.quarantined = True
        result.reason = "failed validation gates"
        qpath = quarantine(RAW, QUARANTINE, SOURCE, VERSION, result)
        print(f"QUARANTINED: {qpath}")
        return 3

    release_dir = publish_release(
        RAW,
        RELEASES,
        f"{SOURCE}-{VERSION}-candidate",
        [
            {
                "source_id": SOURCE,
                "version_id": VERSION,
                "sha256": record.sha256,
                "licence": "ODbL-1.0",
            }
        ],
        city_config={"city": "leeds", "note": "candidate release; activation requires QA + attribution gates"},
    )
    print(f"RELEASED: {release_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
