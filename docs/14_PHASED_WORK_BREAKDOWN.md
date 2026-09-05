# Phased Work Breakdown

Execute sequentially. A phase closes only when its acceptance IDs pass and evidence files exist.

## Phase 0 — Preflight and authority

Read pack; external-volume check; git init; copy source brief; record versions; resolve author-owned blockers that affect build. Output baseline manifests. Gate: A01.

## Phase 1 — Monorepo and design system

Scaffold web/API/packages, lockfiles, lint/type/test, Storybook, fonts/licences, tokens and core components/states. No map feature logic. Gate: component keyboard/contrast/zoom evidence.

## Phase 2 — Synthetic vertical slice

Use labelled synthetic Leeds fixtures to implement Home → Preferences → My Reach → result and list equivalent. API mocked behind generated client. Gates: A03, A04, A07, A12, A20.

## Phase 3 — Data pipeline foundation

Manifest, immutable raw store, safe download, schema/CRS/geometry/freshness/licence QA, quarantine and versioned publish. Start with a small OSM Leeds extract and one admissible authoritative dataset. Gates: A10, A11, A17.

## Phase 4 — Spatial API and router

PostGIS migrations, Valhalla pinned image/tiles, meta/place endpoints, bounded geocoding, route/reach endpoints and failure handling. Gates: A02, A05, A06, A14.

## Phase 5 — V1 features

Implement EasyRoute, Rest Gap, Toilets, Services, ParkMatch and confidence disclosures with real active release. Maintain non-map equivalents. Gates: A08, A09 plus all journey tests.

## Phase 6 — Hardening

Manual accessibility matrix, security/privacy checks, performance/load, PWA shell, attribution, responsive visual QA, backup/restore and rollback. Gates: A12–A20.

## Phase 7 — Clean-room handoff

Fresh checkout on SSD, bootstrap, build, fixtures, integration and E2E from documented commands. Produce `evidence/FINAL_ACCEPTANCE_REPORT.md`, `RELEASE_MANIFEST.json`, screenshots and unresolved table. No production deployment.

## Dependency order

P0 → P1 → P2; P2 and P3 inform P4; P3 + P4 → P5 → P6 → P7. Do not download full regional data before the synthetic vertical slice proves contracts and storage.

