# Phase 6 Summary
**Status: PASS on all automatable hardening gates; three genuinely manual checks remain author-visible (recorded honestly below).**

Automated evidence:
- **A13 privacy**: log-capture test proves request coordinates never appear in API access logs (path-only logging middleware verified against a live places request).
- **A15 performance (dev-scale)**: 30 concurrent /api/v1/places requests, all 200, well inside budget; documented as development-scale evidence, not production load certification.
- **A18 restore/rollback**: live test activates a second release, verifies meta switches, rolls back to the prior release and verifies restoration; data rows never mutated.
- **A16 PWA offline shell**: Playwright test loads the app, goes offline, reloads — the shell recovers from the service worker while the API path is explicitly excluded from offline fallback (no offline data is promised).
- **A17 attribution**: visible "© OpenStreetMap contributors (ODbL) · council data © Leeds City Council (OGL)" on the map stage; full licence/attribution register on /about.
- **A12 automated**: axe scans clean on all screens at both viewports (20/20 e2e).
- Responsive QA: desktop 1440×900 + mobile 390×844 journeys, reflow at 320 CSS px — 20/20.

Genuinely manual, outstanding (cannot be automated honestly):
- VoiceOver/NVDA screen-reader pass (A12 manual matrix)
- True browser 200% zoom + OS high-contrast modes (beyond the 320px reflow equivalent)
- Production load certification (A15 at staging scale)
