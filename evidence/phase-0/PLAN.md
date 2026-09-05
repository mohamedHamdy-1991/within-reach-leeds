# Phase 0 Plan

Goal: close the preflight/authority phase per `AGENTS.md` and `docs/14_PHASED_WORK_BREAKDOWN.md`.

Steps:
1. Run `scripts/check_external_volume.sh` (positive) and one negative-path probe (A01).
2. Record tool versions; resolve pnpm strategy (corepack, store on SSD).
3. `git init -b main`; stage and commit the untouched scaffold as the baseline.
4. Produce baseline manifests (`baseline_file_list.txt`, `baseline_manifest.sha256`).
5. Write `evidence/PREFLIGHT.md` and this evidence pack.

Acceptance: A01 — external-volume preflight aborts safely when the mount/path/free-space rule fails.

Out of scope: any install, download, or feature code (Phase 1+).
