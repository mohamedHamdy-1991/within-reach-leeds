# Decisions and Assumptions

## Locked

- Product name: WITHIN REACH — Leeds.
- V1 is a responsive web PWA, not native applications.
- No account and no runtime AI.
- Preferences are functional journey settings, not health data, and default to device-only storage.
- Deterministic route scoring wraps/extends a routing engine; it does not invent a routing engine from scratch.
- All heavy development and data storage remains on `/Volumes/Mo.Hamdy`.
- Visual direction is the **Leeds wayfinding field** described in `DESIGN.md`: quiet civic precision with one signature personalised reach contour.

## Inferred from the brief; validate through usability research

- The primary first-run task is “Where can I go?” from current location or a typed place/postcode.
- Mobile portrait is the dominant viewport; desktop supports planning and comparison.
- English is V1, but layout and data structures must be localisation-ready.
- No council co-brand or official endorsement exists.
- Public launch uses self-hosted/permitted vector tiles rather than community tile services.

## Author-owned before public launch

- Legal entity/name, contact email, privacy-controller identity and registered address.
- Repository licence choice for original code.
- Production host, domain, budget and monitoring destination.
- Whether public analytics are enabled; default is off.
- Approval of public safety/legal wording after specialist review.

## Decision log format

Append only: `YYYY-MM-DD | ID | decision | evidence | files affected | reversible?`.


## Decision log

- 2026-09-05 | D-P0-01 | Executed Phase 0: git init on main, baseline commit a06d0d6 (61 scaffold files preserved byte-for-byte), A01 negative test recorded | evidence/phase-0/ | evidence/, .git/ | reversible
- 2026-09-05 | D-P1-01 | pnpm 11.25.0 activated via corepack with COREPACK_HOME and storeDir/cacheDir beneath project .runtime (pnpm 11 reads workspace settings from pnpm-workspace.yaml, not .npmrc); misplaced volume-root store /Volumes/Mo.Hamdy/.pnpm-store removed after migration | pnpm store path → /Volumes/.../.runtime/pnpm-store/v11 | pnpm-workspace.yaml | reversible
- 2026-09-05 | D-P1-02 | Node v26.8.1 used instead of Node 22 LTS (system tool, not cache/data; Node 26 is current release line); engines not pinned yet — revisit before CI | evidence/PREFLIGHT.md | — | reversible
- 2026-09-05 | D-P1-03 | Storybook deferred from Phase 1 to Phase 2: acceptance gate needs component keyboard/contrast/zoom evidence, which vitest + axe-core + Testing-Library fixtures provide now; Storybook is a ~300 MB tooling install whose stories would duplicate the test fixtures at this stage | evidence/phase-1/CHECK_RESULTS.json | docs/14_PHASED_WORK_BREAKDOWN.md not modified | reversible
- 2026-09-05 | D-P1-04 | Foreign uncommitted landing-page changes (per-task map modes, mobile composition, home tabs; authored outside this session ~11:02) preserved verbatim in commit e5778f7 rather than reverted, to protect concurrent-session work | git show e5778f7 | apps/web/{index.html,app.js,styles.css} | reversible
- 2026-09-05 | D-P1-05 | Fonts vendored: Atkinson Hyperlegible Next variable + IBM Plex Mono 400/700 from google/fonts, OFL 1.1, Latin-subset woff2 (12–34 KB each), TTF sources retained; Source Sans 3 not vendored (not in DESIGN.md typography) | THIRD_PARTY_DATA.md | packages/design-system/fonts | reversible
- 2026-09-05 | D-P1-06 | Python: editable install with setuptools backend scoped to services*; venv at project .venv; pip cache on SSD; starlette/anyio deprecation warnings on Python 3.14 noted, not blocking | services/api tests 2/2 | pyproject.toml | reversible
