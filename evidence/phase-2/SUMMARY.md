# Phase 2 Summary

**Status: PASS** on the synthetic vertical slice gates (A03 partial — journey shell, A04, A07, A12 automated, A20 screenshots; full seven-journey data behaviour arrives with the live release in Phase 5).

Delivered:
- `apps/web` migrated to React 19 + Vite 6 + React Router 7 (approved stack), faithful to the static shell's semantic HTML, keyboard behaviour, map/text parity, source-register fallback and safety copy. Static shell preserved at `apps/web-legacy/`.
- Routes: `/` (P01), `/preferences` (P02), `/reach` (P03), `/reach/results` (P04), `/confidence` (P13), `/settings` (P14), `/about` (P15), honest preview stubs for route/find/parks.
- My Reach computes deterministically from preferences via `@within-reach/reach-engine` over synthetic fixtures: standard + personal boundaries, area coverage % (withheld rule implemented), category counts, per-place provenance/confidence, "How this was calculated" disclosure, safety notice.
- API client: `/api/v1/meta` with graceful fallback to the local Leeds source register; data-status surfaced in rail + home.
- PWA: vite-plugin-pwa offline shell (8 precached entries, API excluded from fallback), manifest + icons migrated.
- Tests: 9 vitest/axe unit tests + 12 Playwright e2e (desktop 1440×900 and mobile 390×844 journeys, location-denied A04, text-equivalence A07, skip-link keyboard, rail expand/collapse, mobile menu, reflow at 320 px, axe scans on both viewports, 5 evidence screenshots).

Gates: lint 4/4, typecheck 4/4, vitest 39/39 (22+4+4+9), pytest 2/2, e2e 12/12, build clean.
