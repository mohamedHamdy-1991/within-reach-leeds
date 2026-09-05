"""Quarantine and versioned publication. Quarantined data can never be published."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from .download import PipelineError, sha256_file
from .validate import ValidationResult


def quarantine(raw_dir: Path, quarantine_dir: Path, source_id: str, version_id: str, result: ValidationResult) -> Path:
    """Move a failed raw version into quarantine with a machine-readable reason."""
    source_raw = raw_dir / source_id / version_id
    if not source_raw.exists():
        raise PipelineError(f"cannot quarantine missing version: {source_raw}")
    target = quarantine_dir / source_id / version_id
    if target.exists():
        raise PipelineError(f"quarantine slot already occupied: {target}")
    quarantine_dir.mkdir(parents=True, exist_ok=True)
    shutil.move(str(source_raw), str(target))
    (target / "quarantine_reason.json").write_text(json.dumps(result.to_json(), indent=2) + "\n")
    return target


def publish_release(
    raw_dir: Path,
    releases_dir: Path,
    release_id: str,
    entries: list[dict[str, str]],
    *,
    city_config: dict[str, object],
) -> Path:
    """Create an immutable release by hardlinking validated raw versions.

    `entries` is a list of {"source_id", "version_id", "sha256", "licence"} that
    must already have passed validation. The release is rejected if any source
    version is missing, if a checksum mismatches, or if the release ID exists.
    """
    release_dir = releases_dir / release_id
    if release_dir.exists():
        raise PipelineError(f"release already exists (immutable): {release_dir}")
    release_dir.mkdir(parents=True)
    manifest_entries: list[dict[str, object]] = []
    for entry in entries:
        source_raw = raw_dir / entry["source_id"] / entry["version_id"]
        payload = source_raw / "payload"
        if not payload.exists():
            release_dir.rmdir()
            raise PipelineError(f"missing raw version for release: {entry['source_id']}/{entry['version_id']}")
        actual = sha256_file(payload)
        if actual != entry["sha256"]:
            shutil.rmtree(release_dir)
            raise PipelineError(
                f"checksum mismatch for {entry['source_id']}/{entry['version_id']}: "
                f"manifest {entry['sha256']} vs actual {actual}"
            )
        link = release_dir / f"{entry['source_id']}__{entry['version_id']}__payload"
        try:
            link.hardlink_to(payload)
        except OSError:
            shutil.copy2(payload, link)
        retrieval_path = source_raw / "retrieval.json"
        retrieval = json.loads(retrieval_path.read_text()) if retrieval_path.exists() else {}
        manifest_entries.append(
            {
                **entry,
                "sha256_verified": actual,
                "retrieval": retrieval,
            }
        )
    manifest = {
        "release_id": release_id,
        "created_entries": manifest_entries,
        "city": city_config,
        "activation": "manual — a release becomes the active release only after QA gates",
    }
    (release_dir / "RELEASE_MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return release_dir
