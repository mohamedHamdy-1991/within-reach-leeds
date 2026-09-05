#!/usr/bin/env bash
set -euo pipefail
root="/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS"
"$root/scripts/check_external_volume.sh"
mkdir -p "$root/.runtime"/{pnpm-store,pip-cache,playwright,tmp,postgres,valhalla,pmtiles}
export PNPM_STORE_DIR="$root/.runtime/pnpm-store"
export npm_config_cache="$root/.runtime/npm-cache"
export PIP_CACHE_DIR="$root/.runtime/pip-cache"
export PLAYWRIGHT_BROWSERS_PATH="$root/.runtime/playwright"
export TMPDIR="$root/.runtime/tmp"
printf 'Runtime directories prepared beneath %s\n' "$root/.runtime"
printf 'Next: enable the matching variables in .env, then install only from this root.\n'

