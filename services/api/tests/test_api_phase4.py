"""Phase 4 API gates (A14) plus live smoke tests against real services."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from services.api.app import main as app_main
from services.api.app.main import create_app


@pytest.fixture()
def client_with_fakes():
    class FakeDB:
        async def meta(self):
            return {
                "mode": "release-candidate",
                "dataReleaseId": "test-release",
                "message": "ok",
                "sources": [{"source_id": "osm", "licence": "ODbL-1.0"}],
            }

        async def places(self, lat, lon, category, limit):
            return {"dataReleaseId": "test-release", "places": []}

        async def geocode(self, q, limit):
            return {"results": [], "boundedTo": "leeds-release-index"}

    class FakeValhalla:
        async def route(self, waypoints, costing, preferences):
            return {"scoringVersion": "test", "route": {"trip": {}}}

        async def reach(self, lat, lon, minutes):
            return {"scoringVersion": "test", "kind": "standard_reach", "geometry": {}}

    return TestClient(create_app(db=FakeDB(), valhalla=FakeValhalla()))


def test_healthz(client_with_fakes):
    assert client_with_fakes.get("/healthz").json()["status"] == "ok"


def test_bounds_rejected_outside_city(client_with_fakes):
    # London is inside GB but outside the configured Leeds bounds.
    response = client_with_fakes.get("/api/v1/places", params={"latitude": 51.5074, "longitude": -0.1278})
    assert response.status_code == 422
    assert "outside the configured city bounds" in response.json()["detail"]


def test_bounds_accepted_inside_city(client_with_fakes):
    response = client_with_fakes.get("/api/v1/places", params={"latitude": 53.8008, "longitude": -1.5491})
    assert response.status_code == 200


def test_oversized_route_rejected(client_with_fakes):
    waypoints = [{"latitude": 53.8, "longitude": -1.55, "note": "x"} for _ in range(51)]
    waypoints = [{"latitude": 53.8, "longitude": -1.55} for _ in range(51)]
    response = client_with_fakes.post("/api/v1/route", json={"waypoints": waypoints})
    assert response.status_code == 422  # pydantic max_length=50


def test_route_with_too_few_points_rejected(client_with_fakes):
    response = client_with_fakes.post(
        "/api/v1/route",
        json={"waypoints": [{"latitude": 53.8, "longitude": -1.55}]},
    )
    assert response.status_code == 422


def test_rate_limit_returns_429(client_with_fakes):
    limit = app_main.settings.rate_limit_per_minute
    statuses = []
    for _ in range(limit + 5):
        statuses.append(client_with_fakes.get("/api/v1/meta").status_code)
    assert 429 in statuses


def test_router_unavailable_is_503_not_fabricated():
    client = TestClient(create_app(db=None, valhalla=None))  # explicit None = unavailable
    response = client.post(
        "/api/v1/route",
        json={"waypoints": [{"latitude": 53.8, "longitude": -1.55}, {"latitude": 53.81, "longitude": -1.56}]},
    )
    assert response.status_code == 503
    assert "rather than guessed" in response.json()["detail"]


@pytest.mark.skipif(
    not os.environ.get("WR_LIVE_SERVICES"),
    reason="live PostGIS/Valhalla smoke tests run only when WR_LIVE_SERVICES=1",
)
class TestLiveServices:
    """Real-data evidence: run with WR_LIVE_SERVICES=1 while db+valhalla containers are up."""

    def test_live_meta_reports_release(self):
        client = TestClient(create_app())
        body = client.get("/api/v1/meta").json()
        assert body["dataReleaseId"] == "osm-west-yorkshire-2026-09-05-candidate"
        assert body["placeCounts"]["essentials"] >= 100

    def test_live_places_returns_provenance(self):
        client = TestClient(create_app())
        body = client.get("/api/v1/places", params={"latitude": 53.8008, "longitude": -1.5491, "limit": 5}).json()
        assert len(body["places"]) == 5
        place = body["places"][0]
        assert place["confidence"] in ("verified", "mapped", "community_verified", "inferred", "unknown")
        assert place["source_id"] == "osm"

    def test_live_reach_isochrone(self):
        client = TestClient(create_app())
        body = client.post("/api/v1/reach?minutes=20", json={"latitude": 53.8008, "longitude": -1.5491}).json()
        assert body["kind"] == "standard_reach"
        assert body["geometry"]["features"]
