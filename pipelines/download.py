"""WITHIN REACH data pipeline foundation (Phase 3).

Immutability rules (AGENTS.md):
- Raw downloads are never overwritten; a re-run with different content is a new version.
- Validation failures quarantine the version; quarantined data never reaches a release.
- Published releases are immutable and addressed by release ID.
"""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_MAX_BYTES = 2 * 1024 * 1024 * 1024  # 2 GiB hard cap per download


class PipelineError(RuntimeError):
    """Fail-closed pipeline error."""


@dataclass
class RetrievalRecord:
    url: str
    retrieved_at: str
    sha256: str
    bytes: int
    http_status: int | None = None
    content_disposition: str | None = None
    notes: list[str] = field(default_factory=list)

    def to_json(self) -> dict[str, object]:
        return {
            "url": self.url,
            "retrieved_at": self.retrieved_at,
            "sha256": self.sha256,
            "bytes": self.bytes,
            "http_status": self.http_status,
            "content_disposition": self.content_disposition,
            "notes": self.notes,
        }


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def download_immutable(
    url: str,
    raw_dir: Path,
    source_id: str,
    version_id: str,
    *,
    max_bytes: int = DEFAULT_MAX_BYTES,
    timeout: int = 120,
    opener: object | None = None,
) -> tuple[Path, RetrievalRecord]:
    """Stream `url` into the immutable raw store.

    Fail-closed: refuses to overwrite existing versions, enforces a size cap,
    and only renames into place after a complete, checksummed download.
    """
    target_dir = raw_dir / source_id / version_id
    if target_dir.exists():
        raise PipelineError(f"raw version already exists (immutable store): {target_dir}")
    raw_dir.mkdir(parents=True, exist_ok=True)

    tmp_dir = Path(tempfile.mkdtemp(prefix="wr-download-", dir=raw_dir))
    tmp_file = tmp_dir / "payload"
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "within-reach-pipeline/0.1"})
        open_fn = opener or urllib.request.urlopen
        with open_fn(request, timeout=timeout) as response:  # type: ignore[operator]
            status = getattr(response, "status", None)
            disposition = response.headers.get("Content-Disposition") if hasattr(response, "headers") else None
            digest = hashlib.sha256()
            size = 0
            with tmp_file.open("wb") as out:
                while chunk := response.read(1024 * 1024):
                    size += len(chunk)
                    if size > max_bytes:
                        raise PipelineError(f"download exceeds size cap ({max_bytes} bytes)")
                    digest.update(chunk)
                    out.write(chunk)
        record = RetrievalRecord(
            url=url,
            retrieved_at=utc_now_iso(),
            sha256=digest.hexdigest(),
            bytes=size,
            http_status=status,
            content_disposition=disposition,
        )
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise PipelineError(f"download failed: {url}: {exc}") from exc

    target_dir.mkdir(parents=True)
    os.rename(tmp_file, target_dir / "payload")
    (target_dir / "retrieval.json").write_text(json.dumps(record.to_json(), indent=2) + "\n")
    tmp_dir.rmdir()
    return target_dir / "payload", record
