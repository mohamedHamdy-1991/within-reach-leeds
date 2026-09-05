# Phase 1 Unresolved

1. **200%-zoom and high-contrast evidence**: requires a real browser matrix (Playwright) — scheduled with the Phase 2 vertical slice, when the app shell exists to zoom.
2. **Screen-reader (VoiceOver/NVDA) pass**: Phase 6 manual accessibility matrix per the test plan.
3. **Storybook deferred** (D-P1-03): component stories live as test fixtures; revisit if visual review tooling is needed for Phase 2 design QA.
4. **GitHub Actions workflows** in scaffold: still present (`ci.yml`, `data-refresh.yml`); must be `workflow_dispatch`-only or removed before any GitHub push — AUTHOR_DECISION_REQUIRED at push time.
5. **Node 26 vs Node 22 LTS** (D-P1-02): engines field not pinned; decide before CI.
6. **Starlette/anyio deprecation warnings on Python 3.14**: harmless now; pin runtime expectations at Phase 4 (PostGIS/Valhalla infra).
7. **A concurrent session is editing apps/web** (D-P1-04): landing-page changes preserved in commit e5778f7; coordinate before Phase 2's faithful migration of the static shell into the React/Vite app to avoid double-build conflicts.
