# WITHIN REACH — Leeds

Implementation-ready handoff for a mobile-first web PWA that answers: **“What can I comfortably reach from here, and can I actually get there?”**

## Read in this order

1. `AGENTS.md` — non-negotiable worker rules and gates.
2. `PRODUCT.md` — product truth, V1 boundary, users and success.
3. `DESIGN.md` and `design/VISUAL_IDENTITY_SHEET.md` — visual authority.
4. `docs/02_PAGE_BY_PAGE_SPEC.md` — every route, state and action.
5. `docs/04_TECHNICAL_ARCHITECTURE.md`, `docs/09_ROUTING_AND_SCORING_SPEC.md`, `docs/11_DATA_MODEL.md`.
6. `docs/05_DATA_SOURCE_REGISTER.md`, `docs/06_DATA_GOVERNANCE_AND_LICENSING.md`.
7. `docs/07_PRIVACY_PERMISSIONS_SECURITY.md`, `docs/08_ACCESSIBILITY_PLAN.md`.
8. `docs/12_TEST_AND_ACCEPTANCE_PLAN.md` and `docs/14_PHASED_WORK_BREAKDOWN.md`.
9. `AUTONOMOUS_EXPERIENCE_WORKER_PROMPT.md` — current paste-ready implementation prompt; supersedes `FINAL_WORKER_PROMPT.md` for the full experience build.

## Canonical location and storage rule

Canonical root: `/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS`

All source, dependencies, containers, databases, map extracts, router tiles, caches, test artifacts and build outputs must remain beneath this root. Run `scripts/check_external_volume.sh` before installing or generating anything. If `/Volumes/Mo.Hamdy` is not mounted, stop; never fall back to the Mac internal disk.

## V1 outcome

A responsive, installable, keyboard- and screen-reader-operable PWA with seven capabilities only: My Reach, EasyRoute, Rest Gap, Toilets, Services, ParkMatch and Data Confidence. It uses deterministic routing and explicit provenance. Unknown data is never presented as accessible.

## Status vocabulary

- `PASS`: acceptance evidence exists.
- `FIXED`: a recorded failure was corrected and retested.
- `REMOVED_UNSUPPORTED`: a claim or feature lacked evidence and was removed.
- `AUTHOR_DECISION_REQUIRED`: only Mohamed can decide.
- `BLOCKER`: fail-closed condition; do not improvise.

## Definition of done

Done means code, tests, evidence, documentation, desktop/mobile screenshots, accessibility checks, licences/attribution and clean-room setup all pass. A running dev server alone is not completion.
