# Phase 0 Preflight — 2026-09-05

## External volume (gate A01)

- `./scripts/check_external_volume.sh` → `PASS: external storage ready at /Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS; free_kb=710326944` (~677 GiB free; rule ≥ 80 GiB).
- Negative test: `PNPM_STORE_DIR=/Users/mohamedali/bad ./scripts/check_external_volume.sh` → `BLOCKER: runtime path leaves external SSD`, exit **24**. Fail-closed behaviour confirmed for the runtime-path rule; mount/path and free-space rules verified by inspection (exit 20/21/23) and by the passing positive run.
- All runtime caches pinned beneath the project root: `.runtime/pnpm-store`, `.runtime/pip-cache`, `.runtime/playwright`, `.runtime/docker`.

## Tool versions

| Tool | Version | Path |
|---|---|---|
| node | v26.8.1 | /Users/mohamedali/.local/bin/node |
| pnpm | **not installed** — to be provided via corepack pinned to `pnpm@11.25.0` (package.json `packageManager`) with store on SSD | — |
| python3 | 3.14.7 | /opt/homebrew/bin/python3 |
| docker | 29.7.2 | Docker Desktop |
| git | 2.50.1 (Apple Git-155) | system |

## Git status

- Repository was **not** initialised at session start. `git init -b main` performed.
- Baseline commit `a06d0d6` = 61 pre-existing scaffold files (authority docs, contracts, design tokens, static shell, CI scaffolding) preserved exactly as found.
- Remote: none. No push (publishing requires author authority).

## Inventory of pre-existing files

See `evidence/phase-0/baseline_manifest.sha256` (61 files, SHA-256) and `baseline_file_list.txt`. No user changes were overwritten; `.gitignore` from the earlier scaffold session kept as-is.

## Blockers

None for Phase 0.

## Notes for later phases

- `pnpm` must be activated via corepack with `PNPM_STORE_DIR`/`npm_config_cache` resolved under the SSD before any install (worker prompt rule).
- `.github/workflows/ci.yml` and `data-refresh.yml` exist from the scaffold. Mohamed's standing constraint on other repos is **zero GitHub Actions minutes**; these workflows must be `workflow_dispatch`-only or removed before any GitHub push. Tracked in `UNRESOLVED.md` as an author-visible item.
