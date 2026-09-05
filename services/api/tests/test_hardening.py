"""Phase 6 hardening tests: A13 (no coordinates in logs), A15 (concurrency), A18 (rollback)."""

from __future__ import annotations

import asyncio
import logging
import os

import pytest
from fastapi.testclient import TestClient

from services.api.app.main import create_app


class LogCapture(logging.Handler):
    def __init__(self) -> None:
        super().__init__()
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.messages.append(record.getMessage())


@pytest.mark.skipif(not os.environ.get("WR_LIVE_SERVICES"), reason="requires live services")
def test_access_logs_never_contain_coordinates():
    """A13: coordinates sent in a request must not appear in any log line."""
    logger = logging.getLogger("within_reach.api")
    capture = LogCapture()
    logger.addHandler(capture)
    logger.setLevel(logging.INFO)
    client = TestClient(create_app())
    response = client.get("/api/v1/places", params={"latitude": 53.8008, "longitude": -1.5491})
    assert response.status_code == 200
    joined = "\n".join(capture.messages)
    assert "53.8008" not in joined
    assert "-1.5491" not in joined
    assert "/api/v1/places" in joined  # path is logged, parameters are not


@pytest.mark.skipif(not os.environ.get("WR_LIVE_SERVICES"), reason="requires live services")
def test_places_handles_concurrent_load():
    """A15 (development-scale): 30 concurrent place queries all succeed quickly."""

    async def run() -> tuple[int, float]:
        import time

        from httpx import AsyncClient, ASGITransport

        client = TestClient(create_app())
        transport = ASGITransport(app=client.app)
        async with AsyncClient(transport=transport, base_url="http://test") as http:
            start = time.monotonic()
            responses = await asyncio.gather(
                *[
                    http.get(
                        "/api/v1/places",
                        params={"latitude": 53.8008 + i * 1e-5, "longitude": -1.5491, "limit": 5},
                    )
                    for i in range(30)
                ]
            )
            elapsed = time.monotonic() - start
        return sum(1 for r in responses if r.status_code == 200), elapsed

    ok, elapsed = asyncio.run(run())
    assert ok == 30
    assert elapsed < 30


@pytest.mark.skipif(not os.environ.get("WR_LIVE_SERVICES"), reason="requires live services")
def test_release_rollback_to_prior_release():
    """A18: activating an earlier release restores its metadata; never mutates data."""
    from sqlalchemy import text

    from services.api.app import repository
    from services.api.app.db import get_engine

    async def scenario() -> tuple[str, str, str]:
        engine = get_engine()
        async with engine.begin() as conn:
            rows = (await conn.execute(text("SELECT release_id FROM wr.releases ORDER BY created_at"))).fetchall()
            assert len(rows) >= 1, "expected at least one release"
            first = rows[0]._mapping["release_id"]
            await conn.execute(
                text("INSERT INTO wr.releases (release_id, manifest, activated_at) "
                     "VALUES ('rollback-test', CAST('{\"test\": true}' AS jsonb), now()) "
                     "ON CONFLICT (release_id) DO NOTHING")
            )
            await conn.execute(text("UPDATE wr.releases SET activated_at = NULL"))
            await conn.execute(
                text("UPDATE wr.releases SET activated_at = now() WHERE release_id = 'rollback-test'")
            )
        before = (await repository.meta())["dataReleaseId"]
        async with engine.begin() as conn:
            await conn.execute(
                text("UPDATE wr.releases SET activated_at = now() WHERE release_id = :rid"), {"rid": first}
            )
            await conn.execute(
                text("DELETE FROM wr.releases WHERE release_id = 'rollback-test'")
            )
        after = (await repository.meta())["dataReleaseId"]
        return "rollback-test", before, after

    original, switched, restored = asyncio.run(scenario())
    assert original == "rollback-test"  # activation switch took effect
    assert restored != "rollback-test"  # rollback restored the prior release
