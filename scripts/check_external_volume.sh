#!/usr/bin/env bash
set -euo pipefail
root="/Volumes/Mo.Hamdy/WITHIN_REACH_LEEDS"
mount="/Volumes/Mo.Hamdy"
[[ -d "$mount" && -d "$root" ]] || { echo "BLOCKER: external SSD is not mounted at $mount" >&2; exit 20; }
resolved="$(cd "$root" && pwd -P)"
[[ "$resolved" == "$mount"/* ]] || { echo "BLOCKER: project resolves outside external SSD: $resolved" >&2; exit 21; }
free_kb="$(df -Pk "$mount" | awk 'NR==2 {print $4}')"
[[ "$free_kb" =~ ^[0-9]+$ ]] || { echo "BLOCKER: could not read free space" >&2; exit 22; }
(( free_kb >= 80 * 1024 * 1024 )) || { echo "BLOCKER: less than 80 GiB free on external SSD" >&2; exit 23; }
for candidate in "${PNPM_STORE_DIR:-$root/.runtime/pnpm-store}" "${PIP_CACHE_DIR:-$root/.runtime/pip-cache}" "${PLAYWRIGHT_BROWSERS_PATH:-$root/.runtime/playwright}" "${DOCKER_DATA_ROOT:-$root/.runtime/docker}"; do
  [[ "$candidate" == "$root"/* ]] || { echo "BLOCKER: runtime path leaves external SSD: $candidate" >&2; exit 24; }
done
echo "PASS: external storage ready at $resolved; free_kb=$free_kb"

