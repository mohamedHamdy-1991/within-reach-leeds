# Phase 7 Unresolved (author actions before public launch)
1. Legal entity, contact email, privacy-controller identity (AUTHOR_DECISION_REQUIRED — currently marked on /about).
2. Repository PUBLIC + licence choice; GitHub push withheld (zero-Actions-minutes rule: scaffold workflows in .github/ must be workflow_dispatch-only or removed first).
3. Hosting/domain/budget decision.
4. Manual accessibility matrix (screen reader, true 200% zoom, OS high-contrast).
5. Staging-scale load certification (A15 evidence is dev-scale).
6. Fresh council datasets to release PRW, crossings, safe places, changing places (PRW quarantined at 533 days).
7. DEM (OS Terrain 50) download + gradient factors (A05 completion) and route Rest Gap UI wiring.
8. Docker/colima: VM disk remains on internal disk for images only; ALL data volumes are on the SSD (verified).

## 2026-09-06 — PUBLISHED
- Repo PUBLIC at https://github.com/mohamedHamdy-1991/within-reach-leeds (Mohamed's explicit instruction "push it to github and make it public").
- Pre-public hardening (commit 8d04e69 + follow-up): CI + data-refresh workflows → workflow_dispatch-only (zero Actions minutes, per standing rule); data payload BINARIES untracked (51 MB OSM PBF, DMN files) — manifests, checksums, retrieval + quarantine JSONs remain in git; .env never tracked (dev password placeholder stays local).
- Known: ~88 MB history includes the OSM blob (GitHub accepted; harmless). Large-file warning acknowledged.
- STILL AUTHOR-DECISION: repository LICENCE file not added — publishing without one = default copyright (no reuse rights granted). Choose MIT/Apache/OGL when ready (AUTHOR_DECISION_REQUIRED).
