# Phase 1 Plan

Goal: monorepo + design system per `docs/14_PHASED_WORK_BREAKDOWN.md` Phase 1.

Steps:
1. Activate pnpm 11.25.0 via corepack; pin storeDir/cacheDir beneath `.runtime/`.
2. Root tooling: turbo.json, tsconfig.base.json (TS strict), eslint flat config, .npmrc notes.
3. `packages/design-system`: tokens (TS + CSS), fonts (OFL, subset woff2), core component tranche (SkipLink, Button, ActionTile, ConfidenceBadge, SafetyNotice, EmptyState, LoadingState, ErrorSummary) with vitest + axe-core + Testing-Library fixtures (keyboard, long text, all confidence labels).
4. `packages/route-score` + `packages/reach-engine`: pure-function scaffolds with tests (no map logic, no Leeds logic).
5. `services/api`: FastAPI scaffold with /healthz + pytest.
6. Gates: turbo lint/typecheck/test + pytest; then evidence.

Gate target: component keyboard/contrast/zoom evidence. Keyboard + contrast covered by automated tests; 200%-zoom and high-contrast manual checks move to Playwright in Phase 2 (recorded in UNRESOLVED).
