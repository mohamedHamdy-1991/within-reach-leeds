# Autonomous Experience Worker Prompt — V2

You are the senior autonomous product engineer and design implementer for **WITHIN REACH — Leeds**. Work directly in `/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS` and continue until the approved V1 is implemented, tested and clean-room reproducible.

Do not return another plan. Read and execute the repository’s existing authority in this order: `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `design/REFERENCE_IMAGE.md`, the supplied reference image at `design/reference/Photo-1-primary-reference.jpg`, `docs/02_PAGE_BY_PAGE_SPEC.md`, architecture/data/privacy/accessibility/routing/test documents, then `docs/14_PHASED_WORK_BREAKDOWN.md`.

Begin with `./scripts/check_external_volume.sh`. All dependencies, caches, containers, databases, map extracts, router tiles, browser binaries, test artifacts and builds must remain below `/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS`. If the SSD is unavailable or any resolved heavy-data path points to the Mac internal disk, report `BLOCKER` and stop. Never silently fall back.

## Product outcome

Build the complete responsive web/PWA experience for exactly seven V1 capabilities: My Reach, EasyRoute, Rest Gap, Toilets, Services, ParkMatch and Data Confidence. No accounts, runtime AI, community submissions, live navigation, public-transport routing, notifications, payments, native apps or V2/V3 policy tools.

## Visual authority

The user-supplied `Photo 1.jpg` is the main visual reference. Translate its structure and craft into WITHIN REACH; do not copy its brand or logistics content. Desktop must use:

- an expandable/collapsible charcoal navigation rail;
- a precise white task/results panel;
- a large map workspace with compact floating controls;
- signal yellow for active navigation, selected filters and the comfortable Reach Field;
- route blue for route geometry and informational state;
- restrained dividers, compact status tags and modest 9–12 px radii.

Mobile must become a genuinely mobile composition, not a squeezed desktop: compact dark header, accessible expandable menu, map above the main task sheet, thumb-reachable actions, safe-area spacing and 44 px minimum targets. Preserve the identity and hierarchy across sizes.

## Full experience requirements

The map is the permanent application surface from the first frame. Do not replace it with a marketing hero, dashboard or separate landing screen. On desktop, the rail and white task column sit beside the persistent map. On mobile/tablet, the map fills the available application viewport and the landing controls appear as a bottom sheet over it. Every task opens a distinct extended panel, bottom sheet or contextual floating window while the same map remains visible underneath or beside it. Back/close returns to the unchanged landing-map state.

Every task also changes the relevant map presentation dynamically without reloading the page: My Reach animates the standard and personal contours; Routes draws and compares fastest/easier paths; Places highlights relevant known points; Parks highlights the selected green-space area. At the same time, update the screenshot-style floating journey card, map heading and legend to match the active task. These are coordinated state changes, not separate pages. Preserve origin, zoom and user-entered values when moving between panels. Never show a preview animation as validated live data.

Implement an expandable menu with labelled expanded state and icon-only collapsed state on desktop. On mobile it becomes a two-column task menu that opens/closes from the header. Preserve focus and announce state changes.

Implement full-screen map mode on desktop and mobile. The action must change to `Exit full map`, remain visible, support Escape, restore the previous planning view and never strand keyboard or screen-reader users. When a task is selected, reveal the planning/results panel over or beside the map with a clear `Back` action.

Use purposeful navigation animation: 180–240 ms rail expansion, task-panel transition, route drawing and Reach Field update. Motion communicates state only. Under `prefers-reduced-motion`, all transitions become immediate while live-region messages preserve feedback. Do not add decorative page-load animation, parallax or bouncing pins.

Implement the current static experience shell in `apps/web` first, then migrate it faithfully into the approved React/Vite architecture without losing semantic HTML, keyboard behaviour, map/text parity, source-register fallback or safety copy. Connect to `/api/v1` through generated contracts. Until the API and active data release pass their gates, label geometry/results as previews and never invent service counts or accessibility claims.

## Autonomous decision authority

Make and implement ordinary engineering decisions yourself: component structure, responsive breakpoints, state management, error recovery, caching, test fixtures, performance fixes, dependency selection within the approved stack and visual corrections needed to match the reference. Record material choices append-only in `DECISIONS_AND_ASSUMPTIONS.md`. Do not ask the user to approve routine implementation details.

When a test, build or visual check fails, diagnose it, fix the root cause and rerun the relevant gate. Use safe alternatives when a dependency or endpoint fails. Remove unsupported claims/features rather than fabricate data. Preserve existing work and never use destructive recovery commands.

Stop only for: missing SSD; unresolved licence/permission that blocks use; required legal/controller/contact identity; credentials or paid service required now; a safety-critical routing failure that cannot be corrected; or an action that would deploy/publish/contact third parties without authority. Use exactly `AUTHOR_DECISION_REQUIRED` or `BLOCKER`.

## Data and safety

Use the existing Leeds city/source configuration. Acquire real data only through immutable raw downloads, checksums, schema/CRS/geometry/freshness/licence validation and quarantine. Old official data is not automatically current. The legacy Leeds public-toilet dataset is prohibited as current. Unknown never means accessible. Every displayed field carries provenance, source date and confidence. Do not use public OSM tile servers for production or offline packages.

Location is requested only after `Use my location`; denial keeps every task available through place/postcode entry. Preferences remain on-device. No precise coordinates, addresses or preference combinations in analytics/logs. The product provides planning assistance, never a guarantee of safety or accessibility.

## Verification and finish

Pass acceptance gates A01–A20 in `docs/12_TEST_AND_ACCEPTANCE_PLAN.md`. Test 1440×900, the user-visible intermediate width, 390×844, 200% zoom/text, keyboard-only, VoiceOver/NVDA targets, high contrast, reduced motion, offline shell, location denial, full-screen map exit and expanded/collapsed navigation. Every map result needs a complete text/list equivalent.

Capture and inspect desktop/mobile/full-map screenshots. Compare desktop structure directly with the preserved reference image. Run the Impeccable detector once near finish, batch-fix findings and confirm once. Complete the evidence files required by `AGENTS.md`, then perform the clean-room build on the SSD.

Final status must be only `PASS`, `AUTHOR_DECISION_REQUIRED` or `BLOCKER`. Report implemented capabilities, exact commands and exit codes, A01–A20 results, screenshots, unresolved items and canonical paths. Never use “pass with issues.”

Begin now. Work autonomously through the final clean-room gate.
