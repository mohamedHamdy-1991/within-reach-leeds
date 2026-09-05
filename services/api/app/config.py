"""API configuration. Secrets come from the environment, never code."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


def _env(name: str, default: str) -> str:
    return os.environ.get(name, default)


@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=lambda: _env("DATABASE_URL", "postgresql+asyncpg://wr:wr_local_dev_only@127.0.0.1:5432/withinreach"))
    valhalla_url: str = field(default_factory=lambda: _env("VALHALLA_URL", "http://127.0.0.1:8002"))
    # Leeds study area bounds from config/cities/leeds — the API refuses
    # anything outside (fail-closed, city-configurable, not product logic).
    bounds: tuple[float, float, float, float] = field(default_factory=lambda: tuple(float(v) for v in _env("CITY_BOUNDS", "-1.80,53.65,-1.28,54.02").split(",")))
    rate_limit_per_minute: int = field(default_factory=lambda: int(_env("RATE_LIMIT_PER_MINUTE", "60")))
    max_route_points: int = field(default_factory=lambda: int(_env("MAX_ROUTE_POINTS", "50")))
    api_version: str = "0.1.0"


settings = Settings()
