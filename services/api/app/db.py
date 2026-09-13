"""Database access. Coordinates and addresses are never logged (A13)."""

from __future__ import annotations

import asyncio
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from .config import settings

_engine: AsyncEngine | None = None
_engine_loop: int | None = None


def get_engine() -> AsyncEngine:
    # An asyncpg pool is bound to the loop that created it; recreate when the
    # running loop changes (multiple test portals / worker reloads).
    global _engine, _engine_loop
    loop_id = id(asyncio.get_running_loop())
    if _engine is None or _engine_loop != loop_id:
        if _engine is not None:
            _engine.sync_engine.dispose()
        _engine = create_async_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            pool_timeout=60,
        )
        _engine_loop = loop_id
    return _engine


async def fetch_all(query: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    async with get_engine().connect() as connection:
        result = await connection.execute(text(query), params or {})
        return [dict(row._mapping) for row in result]


async def fetch_one(query: str, params: dict[str, Any] | None = None) -> dict[str, Any] | None:
    rows = await fetch_all(query, params)
    return rows[0] if rows else None
