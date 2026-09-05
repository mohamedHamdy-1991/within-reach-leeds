"""WITHIN REACH API — Phase 1 scaffold.

Only a health endpoint exists; Phase 4 adds meta/place/route/reach endpoints
backed by PostGIS and Valhalla. No city-specific logic here.
"""

from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(
    title="WITHIN REACH API",
    version="0.0.1",
    description="Planning assistance API. Never a guarantee of safety or accessibility.",
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "within-reach-api", "version": "0.0.1"}
