# Data Model

## Core tables

- `data_release(id, city_id, created_at, status, manifest_sha256)`
- `source_version(id, source_id, retrieved_at, upstream_modified_at, sha256, licence_id, qa_status)`
- `place(id, city_id, category, name, geom, address, source_release_id)`
- `place_attribute(id, place_id, key, typed_value, confidence, source_version_id, observed_at, valid_to)`
- `network_edge(id, geom, length_m, mode_flags, steps, surface, crossing_type, gradient_est, release_id)`
- `edge_attribute(id, edge_id, key, typed_value, confidence, source_version_id)`
- `rest_point(id, place_id, geom, seat_count, covered, backrest, confidence)`
- `park(id, place_id, geom)` and `park_access_point(id, park_id, geom, attributes…)`
- `route_result(id, expires_at, data_release_id, scoring_version, request_hash, geometry, summary_json)`
- `scoring_config(version, effective_at, config_json, evidence_note)`

No end-user, medical profile or precise-location history table in V1.

## Enumerations

Confidence: `verified | mapped | community_verified | inferred | unknown`. QA: `candidate | quarantined | passed | active | retired`. Attribute values support boolean/number/text/enum plus `unknown`; null never ambiguously means false.

## Conflation

Use stable internal IDs and retain all source IDs. Deduplicate by category-aware spatial/name rules; never overwrite conflicting attributes. Precedence is field-specific and considers recency, authority and precision. Every winning value keeps the alternatives and reason.

JSON Schemas in `/contracts` are client/pipeline boundaries; database migrations and Pydantic/Zod models must agree through contract tests.

