"""Deterministic unit tests for the pipeline foundation (no network)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import IO, Any
from urllib.error import URLError

import pytest

from pipelines.download import PipelineError, download_immutable, sha256_file
from pipelines.publish import publish_release, quarantine
from pipelines.validate import (
    ValidationResult,
    validate_freshness,
    validate_geojson,
    validate_licence,
    validate_osm_pbf,
)


class FakeResponse:
    def __init__(self, payload: bytes, status: int = 200) -> None:
        self._payload = payload
        self.status = status
        self.headers: dict[str, str] = {"Content-Disposition": 'attachment; filename="x"'}
        self._io: IO[bytes] | None = None

    def read(self, size: int) -> bytes:
        assert self._io is not None
        return self._io.read(size)

    def __enter__(self) -> "FakeResponse":
        import io

        self._io = io.BytesIO(self._payload)
        return self

    def __exit__(self, *args: Any) -> None:
        self._io = None


def fake_opener(payload: bytes):
    def open_fn(request: object, timeout: int) -> FakeResponse:
        return FakeResponse(payload)

    return open_fn


def failing_opener(request: object, timeout: int) -> None:
    raise URLError("boom")


def test_download_immutable_stores_checksum_and_refuses_overwrite(tmp_path: Path) -> None:
    payload = b"hello leeds"
    raw_dir = tmp_path / "raw"
    target, record = download_immutable(
        "https://example.org/leeds.osm.pbf",
        raw_dir,
        "osm",
        "2026-09-05",
        opener=fake_opener(payload),
    )
    assert target.read_bytes() == payload
    assert record.bytes == len(payload)
    assert record.sha256 == sha256_file(target)
    retrieval = json.loads((target.parent / "retrieval.json").read_text())
    assert retrieval["sha256"] == record.sha256

    with pytest.raises(PipelineError, match="immutable store"):
        download_immutable(
            "https://example.org/leeds.osm.pbf",
            raw_dir,
            "osm",
            "2026-09-05",
            opener=fake_opener(payload),
        )


def test_download_failure_leaves_no_raw_version(tmp_path: Path) -> None:
    raw_dir = tmp_path / "raw"
    with pytest.raises(PipelineError, match="download failed"):
        download_immutable(
            "https://example.org/leeds.osm.pbf",
            raw_dir,
            "osm",
            "v1",
            opener=failing_opener,
        )
    assert not (raw_dir / "osm" / "v1").exists()


def test_size_cap_fails_closed(tmp_path: Path) -> None:
    raw_dir = tmp_path / "raw"
    with pytest.raises(PipelineError, match="size cap"):
        download_immutable(
            "https://example.org/big",
            raw_dir,
            "osm",
            "big",
            max_bytes=10,
            opener=fake_opener(b"x" * 1024),
        )
    assert not (raw_dir / "osm" / "big").exists()


def test_validate_osm_pbf_header(tmp_path: Path) -> None:
    import struct

    blob_header = b"\x0a\x09OSMHeader" + b"\x00" * 4  # field 1 ("type") = "OSMHeader"
    good = tmp_path / "good.pbf"
    good.write_bytes(struct.pack(">I", len(blob_header)) + blob_header)
    result = ValidationResult(source_id="osm", version_id="v")
    validate_osm_pbf(good, result)
    assert result.passed

    bad = tmp_path / "bad.pbf"
    bad.write_bytes(b"PK\x03\x04not-osm")
    result2 = ValidationResult(source_id="osm", version_id="v")
    validate_osm_pbf(bad, result2)
    assert not result2.passed


def test_validate_geojson_bbox_and_geometry(tmp_path: Path) -> None:
    inside = {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.5491, 53.8008]}, "properties": {}}
        ],
    }
    path = tmp_path / "inside.geojson"
    path.write_text(json.dumps(inside))
    result = ValidationResult(source_id="wards", version_id="v")
    validate_geojson(path, result)
    assert result.passed

    far = dict(inside)
    far["features"] = [
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [10.0, 51.0]}, "properties": {}}
    ]
    path2 = tmp_path / "far.geojson"
    path2.write_text(json.dumps(far))
    result2 = ValidationResult(source_id="wards", version_id="v")
    validate_geojson(path2, result2)
    assert not result2.passed


def test_freshness_and_licence_gates() -> None:
    from pipelines.download import utc_now_iso

    result = ValidationResult(source_id="s", version_id="v")
    validate_freshness({"retrieved_at": utc_now_iso()}, result, max_age_days=30)
    assert result.passed
    result2 = ValidationResult(source_id="s", version_id="v")
    validate_freshness({"retrieved_at": "2020-01-01T00:00:00Z"}, result2, max_age_days=30)
    assert not result2.passed
    result3 = ValidationResult(source_id="s", version_id="v")
    validate_licence("ODbL-1.0", result3, admissible={"ODbL-1.0", "OGL-UK-3.0"})
    assert result3.passed
    result4 = ValidationResult(source_id="s", version_id="v")
    validate_licence(None, result4, admissible={"ODbL-1.0"})
    assert not result4.passed


def test_quarantine_moves_version_and_publish_refuses_quarantined(tmp_path: Path) -> None:
    raw_dir = tmp_path / "raw"
    payload = b"data"
    target, record = download_immutable(
        "https://example.org/x",
        raw_dir,
        "crossings",
        "v1",
        opener=fake_opener(payload),
    )
    quarantine_dir = tmp_path / "quarantine"
    result = ValidationResult(source_id="crossings", version_id="v1", quarantined=True, reason="stale")
    qpath = quarantine(raw_dir, quarantine_dir, "crossings", "v1", result)
    assert (qpath / "quarantine_reason.json").exists()
    assert not target.exists()

    releases = tmp_path / "releases"
    with pytest.raises(PipelineError, match="missing raw version"):
        publish_release(
            raw_dir,
            releases,
            "r1",
            [{"source_id": "crossings", "version_id": "v1", "sha256": record.sha256, "licence": "OGL-UK-3.0"}],
            city_config={},
        )


def test_publish_release_is_immutable_and_checksum_verified(tmp_path: Path) -> None:
    raw_dir = tmp_path / "raw"
    payload = b"release payload"
    _, record = download_immutable(
        "https://example.org/y", raw_dir, "osm", "v1", opener=fake_opener(payload)
    )
    releases = tmp_path / "releases"
    entries = [{"source_id": "osm", "version_id": "v1", "sha256": record.sha256, "licence": "ODbL-1.0"}]
    release_dir = publish_release(raw_dir, releases, "r1", entries, city_config={"city": "leeds"})
    assert (release_dir / "RELEASE_MANIFEST.json").exists()
    manifest = json.loads((release_dir / "RELEASE_MANIFEST.json").read_text())
    assert manifest["release_id"] == "r1"
    assert manifest["created_entries"][0]["sha256_verified"] == record.sha256

    with pytest.raises(PipelineError, match="immutable"):
        publish_release(raw_dir, releases, "r1", entries, city_config={})

    # Tampered raw data cannot enter a new release.
    (raw_dir / "osm" / "v1" / "payload").write_bytes(b"tampered")
    with pytest.raises(PipelineError, match="checksum mismatch"):
        publish_release(raw_dir, releases, "r2", entries, city_config={})
