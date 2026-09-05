# Technical Architecture

## Chosen stack

- Monorepo: pnpm workspaces + Turborepo; Node 22 LTS; TypeScript strict.
- Web: React, Vite, React Router, TanStack Query, MapLibre GL JS, Zod, Workbox/Vite PWA.
- UI: repository design-system package and CSS tokens; no heavy component theme.
- API: Python 3.12+, FastAPI, Pydantic, SQLAlchemy/Alembic, async PostgreSQL driver.
- Spatial store: PostgreSQL 16+ with PostGIS 3.4+.
- Routing: pinned Valhalla container, Leeds OSM extract and DEM on SSD.
- Pipeline: Python, GeoPandas, Shapely, pyogrio/GDAL, rasterio; DuckDB optional for QA only.
- Tiles: generated PMTiles/object storage or licensed provider; MapLibre client.
- Tests: Vitest, Testing Library, Playwright, axe-core, pytest, Ruff, mypy, Schemathesis/property tests.

Pin exact versions in lockfiles at implementation and record them; do not hard-code versions in prose. Use Renovate/Dependabot after a green baseline.

## Boundaries

`apps/web` owns presentation and device-local preferences. `services/api` authenticates no V1 end users, validates requests, queries PostGIS, applies rate limits and returns confidence-rich DTOs. `services/router` owns Valhalla configuration/tiles. Packages own pure design, scoring and reach functions. Pipelines acquire/validate/version data. City configs declare geography and sources.

## Data flow

Source → immutable raw object + checksum + retrieval metadata → schema validation/quarantine → normalized interim records → deduplication/conflation with field-level provenance → PostGIS publish candidate → QA gate → versioned release → API. Never mutate a published release; activate by release ID after checks.

## Storage

All Docker data roots, pnpm store, npm cache, Python virtualenv/cache, GDAL temp files, Postgres volume, Valhalla tiles, PMTiles and Playwright browsers must be set beneath `/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS/.runtime` or project subdirectories. The bootstrap script must print resolved locations and abort if any leave the volume.

## Environments

`local`, `test`, `staging`, `production`. Staging uses synthetic/coarsened locations in logs and separate secrets. Production deploy is a manual approval after staging evidence; the worker must not deploy without explicit authority and credentials.

## API qualities

JSON over HTTPS, `/api/v1`, request IDs, consistent problem-details errors, bounded coordinate precision, server timeouts, circuit breakers around geocoder/router, ETag/cache headers for public catalogues, no caching of private-origin requests at shared edges.

