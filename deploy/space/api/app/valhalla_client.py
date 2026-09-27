"""Valhalla client. Router output is planning assistance, never a guarantee."""

from __future__ import annotations

from typing import Any

import httpx

from .config import settings

# Scoring version records which factor weights produced a result (determinism, A07).
SCORING_VERSION = "2026-09-generalised-cost-hypothesis-1"


class ValhallaClient:
    def __init__(self, base_url: str | None = None, client: httpx.AsyncClient | None = None) -> None:
        self.base_url = base_url or settings.valhalla_url
        self.client = client or httpx.AsyncClient(base_url=self.base_url, timeout=30)

    async def route(
        self,
        waypoints: list[Any],
        costing: str,
        preferences: dict[str, Any] | None,
    ) -> dict[str, Any]:
        locations = [{"lat": w.latitude, "lon": w.longitude} for w in waypoints]
        payload: dict[str, Any] = {
            "locations": locations,
            "costing": costing,
            "alternatives": 2,
            "units": "kilometers",
        }
        if preferences:
            payload["costing_options"] = {costing: preferences}
        response = await self.client.post("/route", json=payload)
        if response.status_code != 200:
            # Valhalla error codes are passed through; never log the coordinates.
            return {
                "error": "router_error",
                "routerStatus": response.status_code,
                "message": "The router could not produce a route for this request. No route is shown rather than a guessed one.",
                "scoringVersion": SCORING_VERSION,
            }
        data = response.json()
        return {
            "scoringVersion": SCORING_VERSION,
            "safety": "Planning assistance only. Conditions can change; check the route and surroundings.",
            "route": data,
        }

    async def reach(self, latitude: float, longitude: float, minutes: list[int]) -> dict[str, Any]:
        payload = {
            "contours": [{"time": m} for m in minutes],
            "costing": "pedestrian",
            "locations": [{"lat": latitude, "lon": longitude}],
            "polygons": True,
            "denoise": 0.5,
        }
        response = await self.client.post("/isochrone", json=payload)
        if response.status_code != 200:
            return {
                "error": "router_error",
                "routerStatus": response.status_code,
                "message": "The router could not produce a reach boundary for this request.",
                "scoringVersion": SCORING_VERSION,
            }
        return {
            "scoringVersion": SCORING_VERSION,
            "kind": "standard_reach",
            "contours": minutes,
            "note": "Standard pedestrian reach. Personal comfortable reach applies preference factors on top of this geometry.",
            "geometry": response.json(),
        }

    async def aclose(self) -> None:
        await self.client.aclose()
