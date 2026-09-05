# Test and Acceptance Plan

## Acceptance IDs

| ID | Acceptance test |
|---|---|
| A01 | external-volume preflight aborts safely when mount/path/free-space rule fails |
| A02 | fresh clone/bootstrap works without writing caches/data to internal disk |
| A03 | all seven V1 journeys pass desktop 1440×900 and mobile 390×844 |
| A04 | location denied still permits every task through place/postcode input |
| A05 | known steps never appear in hard step-avoid routes |
| A06 | unknown steps/surface/kerb are disclosed, never converted to accessible |
| A07 | standard and personal reach are deterministic and text-equivalent |
| A08 | Rest Gap fixture distances and unknown coverage match hand calculations |
| A09 | ParkMatch separates known match/mismatch/unknown |
| A10 | every displayed data field traces to active source/version/licence |
| A11 | stale/quarantined sources cannot enter active release |
| A12 | WCAG automated and manual matrix passes exit criteria |
| A13 | no coordinate/address appears in logs, analytics, shared cache or error tracker |
| A14 | API schema, bounds, rate limit and oversized-geometry tests pass |
| A15 | performance budgets pass under documented staging load |
| A16 | PWA install/shell recovery works; unsupported offline routes are not promised |
| A17 | OSM/OS/OGL attribution is visible and complete |
| A18 | restore test and rollback to prior data release succeed |
| A19 | clean-room reproduction matches fixture outputs and manifests |
| A20 | screenshots show no overflow, obscured focus or illegible map UI at target sizes |

## Test layers

Unit: scoring, units, confidence, copy guards. Property: monotonic penalties, hard constraints, bounds. Contract: OpenAPI/JSON Schema/Pydantic/Zod. Integration: PostGIS, Valhalla, pipeline release. E2E: all journeys and failures. Visual: component/story screenshots and pages. Accessibility: automated plus manual. Security: SAST, dependency/container/secrets scan, basic DAST. Data: schema, geometry, CRS, counts, duplicates, freshness, attribution.

## Evidence

`CHECK_RESULTS.json` contains acceptance ID, command, exit code, artifact path, timestamp and commit. Screenshots are opened/visually inspected, not merely generated. A flaky or skipped safety/accessibility test is a failure.

