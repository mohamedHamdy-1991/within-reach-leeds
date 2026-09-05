from __future__ import annotations

from fastapi.testclient import TestClient

from services.api.app.main import app

client = TestClient(app)


def test_healthz_reports_ok() -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "within-reach-api"


def test_openapi_is_generated() -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "/healthz" in response.json()["paths"]
