# Worker Contract

This file applies to the entire repository.

## Operating instruction

Implement the approved V1 exactly. Do not redesign the product, add features, substitute technologies without evidence, or ask the user to choose ordinary implementation details. Make reasonable low-risk choices within this contract and record them in `DECISIONS_AND_ASSUMPTIONS.md`.

## Mandatory preflight

1. Confirm `pwd` resolves beneath `/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS`.
2. Run `./scripts/check_external_volume.sh` and record the result.
3. Read every controlling document listed in `START_HERE.md`.
4. Inventory existing files and preserve user changes.
5. Create `evidence/PREFLIGHT.md` with volume, free space, tool versions, git status and blockers.

If the external volume is absent, there is less than 80 GiB free, or any resolved cache/data path points to `/Users/mohamedali`, mark `BLOCKER` and stop before downloads or installs.

## Scope locks

V1 contains exactly: My Reach, EasyRoute, Rest Gap, Toilets, Services, ParkMatch and Data Confidence. Do not build accounts, AI/LLM features, community submissions, live navigation, live transit, notifications, payments, native apps, medical profiles, carer accounts or policy analytics.

Leeds must be configuration, never hard-coded product logic. Shared logic lives in packages; Leeds source definitions live under `config/cities/leeds/`.

## Safety and truth

- Never infer accessibility from missing data.
- Label each value `verified`, `mapped`, `community_verified`, `inferred` or `unknown`.
- Never claim wheelchair suitability, step-free access or current opening status without supporting fields and freshness.
- Routing output is planning assistance, not a guarantee. Always show uncertainty and a safety note.
- No medical or disability diagnosis is collected. Preferences stay on-device by default.
- No destructive source-data rewrite. Raw downloads are immutable and checksummed.
- An upstream schema/freshness/licence failure quarantines that source; it does not silently publish stale or malformed data.

## Build rules

- TypeScript strict mode; Python type hints; reproducible lockfiles.
- Validate external data at the boundary with explicit schemas.
- No production dependency on public OSM raster/vector tile endpoints. Build/host permitted PMTiles or configure a compliant provider.
- No secret in frontend bundles, git history, fixtures or logs.
- No network request before consent except essential first-party app assets and map style required for the requested screen.
- Prefer server-side postcode geocoding proxy with rate limits and redacted logs; never log precise user locations.
- Tests accompany each feature; accessibility is part of definition of done.

## Required evidence per phase

Each phase in `docs/14_PHASED_WORK_BREAKDOWN.md` must produce:

- `evidence/phase-N/PLAN.md`
- `evidence/phase-N/COMMANDS_RUN.txt`
- `evidence/phase-N/CHECK_RESULTS.json`
- `evidence/phase-N/FILES_CHANGED.csv`
- `evidence/phase-N/SUMMARY.md`
- `evidence/phase-N/UNRESOLVED.md`

Central decisions are append-only. Do not self-award `PASS`; tie it to the acceptance IDs in `docs/12_TEST_AND_ACCEPTANCE_PLAN.md`.

## Stop conditions

Stop with `BLOCKER` for: missing external SSD; unresolved data licence; inability to meet a safety-critical acceptance test; unsupported accessibility claim; secrets exposure; corrupt raw source; routing that can traverse known forbidden steps; or any required author-owned legal identity/contact fields.

