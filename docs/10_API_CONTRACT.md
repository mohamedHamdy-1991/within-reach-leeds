# API Contract

Implement and generate OpenAPI from FastAPI; TypeScript clients are generated, never hand-drifted.

## Endpoints

- `GET /api/v1/health/live` and `/ready`
- `GET /api/v1/meta` → app/data/scoring versions, city, attribution
- `GET /api/v1/geocode?q=` → bounded Leeds results via compliant provider/proxy
- `POST /api/v1/reach` → origin, minutes, preference profile; returns standard/personal GeoJSON, coverage and counts
- `POST /api/v1/routes/compare` → origin, destination, preferences; returns fastest/easiest options and factor decomposition
- `GET /api/v1/routes/{id}` → short-lived route detail
- `GET /api/v1/places` → bbox/origin/category/filters/confidence/page
- `GET /api/v1/places/{id}` → attributes with field provenance
- `GET /api/v1/parks` and `GET /api/v1/parks/{id}`
- `GET /api/v1/sources` → source/version/licence/freshness register

## Contract rules

Coordinates are WGS84 `[longitude, latitude]`, validated against configured bounds. Distances are metres; durations seconds; gradients decimal ratio internally and percent in presentation DTO. Time fields ISO 8601 UTC. Every response has `dataReleaseId`, `scoringVersion`, `requestId` and relevant `warnings`.

Errors use RFC 9457 problem details. Use 422 for invalid preference/range, 429 for rate limit, 503 when routing/source release unavailable. A partial result is 200 only when the missing portion is explicit in `warnings` and no safety-critical constraint was bypassed.

## Performance budgets

After warm-up on staging: metadata/list p95 <500 ms; place p95 <700 ms; route compare p95 <3 s; reach p95 <5 s. These are engineering targets, validated under a stated load profile, not public SLAs.

