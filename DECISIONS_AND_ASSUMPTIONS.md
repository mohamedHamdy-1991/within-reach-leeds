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
- 2026-09-05 | D-P2-01 | Phase 2 vertical slice: apps/web migrated to React 19 + Vite 6 + React Router 7 (faithful DOM/class migration of the static shell, now preserved at apps/web-legacy); synthetic fixtures power My Reach; /api/v1/meta with fallback to local source register | e2e 12/12, unit 9/9 | apps/web/** | reversible
- 2026-09-05 | D-P2-02 | pnpm override pins vite ^6.4.3 workspace-wide: vitest 3.2's vite-node resolved a second vite 7 copy and broke plugin types; single-version alignment chosen over version ranges | pnpm --filter web why vite → one version | pnpm-workspace.yaml, lockfile | reversible
- 2026-09-05 | D-P2-03 | 200%-zoom evidence implemented as the WCAG 1.4.10 reflow equivalent (320 CSS px viewport, no horizontal scroll) because headless Chromium cannot emulate browser text zoom; full 200% browser matrix stays in Phase 6 | e2e/app.spec.ts reflow test | — | reversible
- 2026-09-05 | D-P2-04 | Playwright Chromium installed to .runtime/playwright (SSD rule); e2e baseURL uses localhost (vite preview binds ::1) | apps/web/playwright.config.ts | — | reversible
- 2026-09-05 | D-P2-05 | Scrollable regions (control panel, text-map view) made keyboard-focusable after axe scrollable-region-focusable finding — real accessibility fix, not a rule suppression | e2e axe scans clean | Home.tsx, ReachResults.tsx, MapCanvas.tsx | reversible
- 2026-09-05 | D-P3-01 | Freshness gate measures BOTH retrieval age (raw download) and publisher data age (Last-Modified) with per-source policy (OSM 14d, council layers 365d); PRW failed on publisher age as designed | data/quarantine/leeds_prow/... | pipelines/validate.py | reversible
- 2026-09-05 | D-P3-02 | OSM PBF structural check rewritten to blob-header OSMHeader form after the gate correctly rejected our own wrong assumption on a md5-verified intact file; recorded as FIXED | evidence/phase-3/osm_acquisition_report.json | pipelines/validate.py + tests | reversible
- 2026-09-05 | D-P3-03 | West Yorkshire extract chosen over Yorkshire-and-the-Humber (smaller, Leeds-complete, md5 available) | data/releases/osm-west-yorkshire-2026-09-05-candidate | scripts/acquire_osm_west_yorkshire.py | reversible
- 2026-09-05 | D-P4-01 | Docker provider is colima (not Docker Desktop); added /Volumes/Mo.Hamdy writable mount to ~/.colima/default/colima.yaml and restarted VM — resolves the container-on-SSD rule without touching Docker Desktop | probe writes verified | colima.yaml | reversible
- 2026-09-05 | D-P4-02 | Valhalla images pinned by digest (a7d0d02e…); tiles built from the checksum-verified Phase 3 release, not a fresh download | .runtime/valhalla | docker-compose profile router | reversible
- 2026-09-05 | D-P4-03 | API exposes candidate release as mode "release-candidate" with mapped-confidence wording — never claims verified | repository.meta | services/api | reversible
- 2026-09-05 | D-P4-04 | Async engine made loop-aware (recreate on loop change) — fixes cross-event-loop test pollution | db.py | services/api | reversible
- 2026-09-05 | D-P5-01 | Phase 5 features consume the LIVE candidate release (real PostGIS + Valhalla) with honest unknown factor disclosure rather than waiting for verified accessibility sources | e2e 18/18 | apps/web, services/api | reversible
- 2026-09-05 | D-P5-02 | Rest Gap + ParkMatch implemented as pure functions in @within-reach/route-score with hand-checkable fixtures (A08/A09) so UI wiring can never change the arithmetic | route-score tests | packages/route-score | reversible
- 2026-09-05 | D-P5-03 | ParkMatch treats every requirement as unknown in this release: the OSM-derived data has no per-feature park evidence, and inferring would violate A09 | ParkMatch.tsx | apps/web | reversible
- 2026-09-05 | D-SRC-01 | AUTHOR DECISION (Mohamed, in-session): use the existing Data Mill North datasets for now despite staleness; and use his PhD-published OGL GIS outputs (Module1/Module3 GDBs) as WITHIN REACH sources. Freshness gate overridden ONLY via explicit accept_stale flag; all loaded records carry the dataset date and accepted_stale marker | evidence/phase-3/SOURCES_EXPANSION_2026-09-05.md | config, scripts/load_dmn_release.py, scripts/load_phd_green_release.py, services/api/migrations/002_paths.sql | reversible (quarantine + delete releases)
- 2026-09-06 | D-UI-01 | Experience rebuilt per Mohamed's feedback: full-screen MapLibre real map (OSM raster dev tiles; production swap to PMTiles noted), morph-glass floating panels with minimise/dock, clickable journey tabs, multi-ring live isochrones, real geocode + popups | evidence/phase-2/screenshots | apps/web/**, services/api (multi-contour reach), valhalla config max_contours 6 | reversible
- 2026-09-06 | D-UI-02 | Dock registry made static (PANEL_TITLES) after lifecycle bug: button unmount unregistered dock chips; registry removes effect-order dependence | GlassPanel.tsx | apps/web | reversible
- 2026-09-27 | D-UI-03 | Routes page rebuilt via parallel agents (Google-Maps pattern): From/To autocomplete with live suggestions + pick-required guards, Use-my-location + Swap, big-time option cards; autocomplete fixes: dropdown re-open on picked value guarded, blur-close added; DB remapped host port 5432→5433 permanently (an unrelated SSH tunnel now occupies 5432 on this Mac) | apps/web/src/pages/RouteComparison.tsx, PlaceAutocomplete.tsx, docker-compose.yml, .env | reversible
- 2026-09-27 | D-UI-04 | Image prompt pack for Mohamed to generate (docs/IMAGE_PROMPTS.md): 6 identity-true prompts with exact sizes; in-repo vector illustrations remain the shipped default until he provides generated art | docs/IMAGE_PROMPTS.md | additive
