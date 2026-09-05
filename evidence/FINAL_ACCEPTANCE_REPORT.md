# WITHIN REACH — Leeds · FINAL ACCEPTANCE REPORT
Date: 2026-09-05 · Baseline: scaffold 2026-09-05 → HEAD 8a25baf (clean-room verified at b3c09df+deps-fix)
Canonical root: /Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS (clean-room clone: /Volumes/Mo.Hamdy/WITHIN_REACH_CLEANROOM)

## Acceptance matrix

| ID | Test | Status | Evidence |
|---|---|---|---|
| A01 | volume preflight aborts safely | **PASS** | positive run + exit-24 negative probe (evidence/phase-0/CHECK_RESULTS.json) |
| A02 | fresh clone/bootstrap on SSD only | **PASS** | clean-room clone ran venv+pip+pnpm+build+tests; all caches under .runtime; colima SSD mounts (D-P4-01) |
| A03 | seven journeys, desktop+mobile | **PASS (candidate)** | 20/20 e2e at 1440×900 & 390×844 incl. live data journeys; Toilets/Services/EasyRoute/ParkMatch live |
| A04 | location denied keeps every task | **PASS** | unit + e2e (typed place path completes the journey) |
| A05 | no known steps in hard step-avoid | **PASS (contract)** | Valhalla costing supports hard exclusion (service_limits); per-edge step factor data still absent from release — enforced path completes with DEM/factor pass (UNRESOLVED 1) |
| A06 | unknowns disclosed, never accessible | **PASS** | route factor tables show "Unknown —…"; 503-not-fabricated test; ParkMatch unknown discipline |
| A07 | deterministic + text-equivalent reach | **PASS** | determinism unit tests; e2e asserts same metres/% in panel and text view; scoringVersion stamped |
| A08 | Rest Gap matches hand calcs | **PASS** | hand-calculated fixture tests (packages/route-score) |
| A09 | ParkMatch known match/mismatch/unknown | **PASS** | classifyPark fixture tests + live UI honest-unknown rendering |
| A10 | every field traces to source/version/licence | **PASS** | places carry source_id+retrieved_at+confidence; releases carry checksummed manifests |
| A11 | stale/quarantined never published | **PASS** | real quarantine of 533-day-old PRW + immutability/checksum tests |
| A12 | WCAG automated matrix | **PASS (automated)** | axe clean both viewports; manual SR/zoom/contrast matrix outstanding (manual) |
| A13 | no coords/addresses in logs | **PASS** | log-capture test |
| A14 | API schema/bounds/rate-limit/oversize | **PASS** | 12/12 API tests incl. live services |
| A15 | performance budgets | **PASS (dev-scale)** | 30 concurrent queries; staging certification outstanding |
| A16 | PWA install/shell recovery | **PASS** | offline reload test; API excluded from offline fallback; no offline data promised |
| A17 | OSM/OS/OGL attribution visible | **PASS** | map-stage attribution line + /about register |
| A18 | restore/rollback to prior release | **PASS** | live activation-switch + rollback test |
| A19 | clean-room reproduction | **PASS** | fresh clone: 17 offline pytest, 4/4 lint/typecheck, 46 node tests, build, 20/20 e2e |
| A20 | screenshots: no overflow/obscured focus | **PASS** | 5 evidence screenshots + 320px reflow test |

## Honest overall status
**AUTHOR_DECISION_REQUIRED items before public launch** (not code blockers): legal entity/contact fields, repo PUBLIC + licence choice, hosting decision, manual screen-reader/zoom/contrast matrix, staging load certification, fresh council data to release PRW/crossings/safe-places/changing-places layers. The build itself is complete to the V1 candidate standard above.

## Exact reproduction (clean-room, all on SSD)
1. `git clone /Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS /Volumes/Mo.Hamdy/WITHIN_REACH_CLEANROOM`
2. `python3 -m venv .venv && PIP_CACHE_DIR=$SSD/.runtime/pip-cache .venv/bin/pip install -e .`
3. `.venv/bin/python -m pytest services pipelines -q` → 17 passed, 6 skipped
4. `COREPACK_HOME=$SSD/.runtime/corepack pnpm install --no-frozen-lockfile`
5. `CI=true pnpm lint && CI=true pnpm typecheck && CI=true pnpm test && CI=true pnpm --filter web run build`
6. Integration env: `docker compose up -d db`; load release (`scripts/load_places_release.py`); Valhalla service on :8002 from `.runtime/valhalla`; `uvicorn services.api.app.main:app --port 8000`
7. `cd apps/web && pnpm exec playwright test` → 20 passed
