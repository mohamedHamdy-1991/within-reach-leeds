"""WITHIN REACH API — Phase 4: meta, places, bounded geocoding, route, reach.

Safety rules enforced here:
- Every response names its data release and confidence vocabulary (A10).
- Unknown is never upgraded to accessible (A06 is enforced by passing factors through).
- Requests outside the configured city bounds are rejected (A14).
- No coordinates or addresses are logged (A13): access logs contain route + status only.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query, Request
from pydantic import BaseModel, Field

from .config import settings

logger = logging.getLogger("within_reach.api")


class BoundsChecked(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class RouteRequest(BaseModel):
    waypoints: list[BoundsChecked] = Field(min_length=2, max_length=50)
    costing: Literal["pedestrian", "bicycle", "auto"] = "pedestrian"
    preferences: dict[str, Any] | None = None


class RouteFactor(BaseModel):
    factor: str
    status: Literal["known_ok", "known_barrier", "partial", "unknown"]
    confidence: Literal["verified", "mapped", "community_verified", "inferred", "unknown"]
    cost_seconds: float = Field(ge=0)
    explanation: str | None = None


class PlaceOut(BaseModel):
    external_id: str
    name: str
    category: str
    kind: str
    latitude: float
    longitude: float
    confidence: str
    source_id: str
    retrieved_at: str


class RateLimiter:
    """In-memory fixed-window limiter. Single-process only (V1 dev/staging)."""

    def __init__(self, per_minute: int) -> None:
        self.per_minute = per_minute
        self._windows: dict[str, tuple[int, int]] = {}

    def allow(self, key: str) -> bool:
        window = int(time.time()) // 60
        count, seen_window = self._windows.get(key, (0, window))
        if seen_window != window:
            count, seen_window = 0, window
        count += 1
        self._windows[key] = (count, seen_window)
        return count <= self.per_minute


def bounds_ok(latitude: float, longitude: float) -> bool:
    min_lon, min_lat, max_lon, max_lat = settings.bounds
    return min_lon <= longitude <= max_lon and min_lat <= latitude <= max_lat


_UNSET = object()


def create_app(*, db: Any = _UNSET, valhalla: Any = _UNSET) -> FastAPI:
    app = FastAPI(
        title="WITHIN REACH API",
        version=settings.api_version,
        description="Planning assistance API. Never a guarantee of safety or accessibility.",
    )
    limiter = RateLimiter(settings.rate_limit_per_minute)
    if db is _UNSET:
        from . import repository as db_module

        db = db_module
    if valhalla is _UNSET:
        from .valhalla_client import ValhallaClient

        valhalla = ValhallaClient()
    state = {"db": db, "valhalla": valhalla}

    @app.middleware("http")
    async def redacted_access_log(request: Request, call_next):  # type: ignore[no-untyped-def]
        # A13: query strings and bodies are never logged (they can carry coordinates).
        response = await call_next(request)
        logger.info("%s %s -> %s", request.method, request.url.path, response.status_code)
        return response

    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "ok", "service": "within-reach-api", "version": settings.api_version}

    @app.get("/api/v1/meta")
    async def meta(request: Request) -> dict[str, Any]:
        _require_rate(request, limiter, request.client.host if request.client else "anon")
        if state["db"] is None:
            return {
                "mode": "no-release",
                "dataReleaseId": None,
                "message": "No validated live accessibility release is active yet.",
                "sources": [],
                "apiVersion": settings.api_version,
            }
        return await state["db"].meta()

    @app.get("/api/v1/places")
    async def places(
        request: Request,
        latitude: float = Query(ge=-90, le=90),
        longitude: float = Query(ge=-180, le=180),
        category: str | None = None,
        limit: int = Query(default=20, ge=1, le=50),
    ) -> dict[str, Any]:
        _require_rate(request, limiter, request.client.host if request.client else "anon")
        _require_bounds(latitude, longitude)
        if state["db"] is None:
            raise HTTPException(status_code=503, detail="No active data release; places are unavailable.")
        return await state["db"].places(latitude, longitude, category, limit)

    @app.get("/api/v1/geocode")
    async def geocode(
        request: Request,
        q: str = Query(min_length=2, max_length=100),
        limit: int = Query(default=5, ge=1, le=10),
    ) -> dict[str, Any]:
        _require_rate(request, limiter, request.client.host if request.client else "anon")
        # Bounded geocoding: only features already inside the city bbox are indexed.
        if state["db"] is None:
            raise HTTPException(status_code=503, detail="Geocoding unavailable without an active release.")
        return await state["db"].geocode(q, limit)

    @app.post("/api/v1/route")
    async def route(request: Request, body: RouteRequest) -> dict[str, Any]:
        _require_rate(request, limiter, request.client.host if request.client else "anon")
        for point in body.waypoints:
            _require_bounds(point.latitude, point.longitude)
        if state["valhalla"] is None:
            raise HTTPException(status_code=503, detail="Router unavailable; no route results are shown rather than guessed results.")
        return await state["valhalla"].route(body.waypoints, body.costing, body.preferences)

    @app.post("/api/v1/reach")
    async def reach(request: Request, body: BoundsChecked, minutes: int = Query(default=20, ge=5, le=30)) -> dict[str, Any]:
        _require_rate(request, limiter, request.client.host if request.client else "anon")
        _require_bounds(body.latitude, body.longitude)
        if state["valhalla"] is None:
            raise HTTPException(status_code=503, detail="Router unavailable; reach is not shown rather than guessed.")
        return await state["valhalla"].reach(body.latitude, body.longitude, minutes)

    def _require_bounds(latitude: float, longitude: float) -> None:
        if not bounds_ok(latitude, longitude):
            raise HTTPException(status_code=422, detail="Location is outside the configured city bounds.")

    def _require_rate(request: Request, limiter: RateLimiter, key: str) -> None:
        if not limiter.allow(key):
            raise HTTPException(status_code=429, detail="Too many requests.")

    return app


app = create_app()
