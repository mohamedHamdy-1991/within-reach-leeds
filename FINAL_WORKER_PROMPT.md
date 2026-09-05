# Final Prompt for the AI Implementation Worker

You are the implementation worker for **WITHIN REACH — Leeds**. Work autonomously to deliver the approved V1 in the existing repository at:

`/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS`

## Mission

Build a production-grade, mobile-first, installable web PWA that answers: **“What can I comfortably reach from here, and can I actually get there?”** Implement the seven approved V1 capabilities only: My Reach, EasyRoute, Rest Gap, Toilets, Services, ParkMatch and Data Confidence.

Do not rethink the product or return a plan. The plan, product truth, visual direction, architecture, routes, scoring model, permissions, data governance, tests and gates already exist in this repository. Read and implement them.

## First actions — mandatory

1. `cd /Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS`.
2. Run `./scripts/check_external_volume.sh`. If it fails, report `BLOCKER` and stop. Never use the Mac internal disk as fallback.
3. Read `START_HERE.md`, then every file it lists, including this prompt.
4. Read repository state and preserve all existing/user changes.
5. Create `evidence/PREFLIGHT.md` containing resolved root, volume/free space, git status, tool versions, runtime/cache paths and identified blockers.
6. Run `./scripts/bootstrap.sh`; export the paths in `.env.example` before any install. Confirm pnpm/npm/pip/Playwright/Docker/temporary/database/router/tile paths all resolve under the project on `/Volumes/Mo.Hamdy`.

## Authority order

`AGENTS.md` → `PRODUCT.md` → `DESIGN.md` → page/architecture/data/security/accessibility/test specs → this prompt. When documents genuinely conflict, choose the safer/narrower interpretation, log it, and do not expand scope.

## Implementation behaviour

- Implement phase-by-phase using `docs/14_PHASED_WORK_BREAKDOWN.md`.
- Do not pause for ordinary technical decisions. Record decisions append-only in `DECISIONS_AND_ASSUMPTIONS.md`.
- Stop only for the explicit conditions in `AGENTS.md`, an author-owned legal/identity choice needed now, or a destructive/external deployment action not authorised.
- Do not deploy production, contact organisations, publish a repository or acquire paid services.
- Do not claim partnership, endorsement, clinical validity or complete accessibility.
- Use labelled synthetic fixtures until a real source passes licence, schema, freshness, geometry and provenance gates.
- Never activate old Leeds Safe Places, Changing Places, crossing or toilet data merely because it is official. The legacy public-toilet dataset is prohibited as current data.
- Unknown data stays unknown and visibly affects route confidence/cost.

## Required build

Create the pnpm monorepo and Python service/pipeline packages described in `docs/04_TECHNICAL_ARCHITECTURE.md`. Pin exact runtime, dependency and container versions/digests; commit lockfiles. Implement generated OpenAPI clients, JSON Schema contract tests, PostGIS migrations, Valhalla configuration, safe acquisition/quarantine/release activation, field-level provenance, deterministic scoring and city configuration.

Build every route/state in `docs/02_PAGE_BY_PAGE_SPEC.md`. The first screen is a working map with exactly four actions. Follow `DESIGN.md`, `design/tokens.*`, the visual identity sheet, component inventory and wireframes. Self-host properly licensed fonts. Create the specified logo/app-icon/map assets as SVG-first assets and document every third-party asset.

Every map result must have a complete list/text alternative. Location is requested only after the user presses `Use my location`; denial must preserve all tasks. Preferences stay device-only. No precise location/address in logs or analytics. No runtime AI, accounts, notifications, live navigation or V2/V3 features.

## Quality gates

Use `docs/12_TEST_AND_ACCEPTANCE_PLAN.md` as the release checklist. Implement and run unit, property, contract, integration, E2E, visual, accessibility, security and data tests. Use the exact acceptance IDs A01–A20 in evidence. A skipped/flaky safety or accessibility test fails.

For UI QA, capture valid screenshots at 390×844 and 1440×900 after disabling/settling entrance motion. Inspect each image. Test 200% text/zoom, keyboard-only, reduced motion, colour-independent meaning and screen-reader tasks. Run the installed Impeccable detector once over changed web targets near finish and fix mechanical findings. Then perform one batched correction and one confirmation pass; do not endlessly polish.

For real data, store immutable raw files with checksums/retrieval metadata, validate before extraction/publish, quarantine failures, activate releases transactionally and prove rollback. Observe ODbL, OGL, OS and asset attribution. Do not use public OSM tile services for production or offline downloads.

## Evidence required for each phase

Create the six artifacts required by `AGENTS.md`. Commands must include exit codes. `CHECK_RESULTS.json` links acceptance ID → command → result → evidence path → commit. `FILES_CHANGED.csv` lists path, action and purpose. `UNRESOLVED.md` is never omitted; write `None` only after checking.

## Final handoff

Do not say “done” until a fresh clean-room checkout on the external SSD can bootstrap, build and pass the documented test suite and A01–A20 are honestly reconciled. Produce:

- `evidence/FINAL_ACCEPTANCE_REPORT.md`
- `evidence/RELEASE_MANIFEST.json`
- `evidence/DATA_RELEASE_MANIFEST.json`
- `evidence/ATTRIBUTION_AUDIT.md`
- `evidence/ACCESSIBILITY_AUDIT.md`
- `evidence/SECURITY_PRIVACY_AUDIT.md`
- `evidence/CLEAN_ROOM_REPRODUCTION.md`
- `evidence/screenshots/mobile.png` and `desktop.png`
- `evidence/FINAL_UNRESOLVED.md`

Final status must be one of: `PASS`, `AUTHOR_DECISION_REQUIRED`, or `BLOCKER`. Never use “pass with issues.” For each unresolved item use `FIXED`, `REMOVED_UNSUPPORTED`, `AUTHOR_DECISION_REQUIRED`, or `BLOCKER`. Report what is implemented, commands/tests and exit codes, acceptance table A01–A20, exact remaining blockers, and the canonical external-SSD path.

Begin now with the storage preflight and implement through the final clean-room gate.

