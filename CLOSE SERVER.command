#!/usr/bin/env bash
# WITHIN REACH — Leeds: CLOSE SERVER for macOS
# Double-click this file. Stops the API, web app, Valhalla and PostGIS.
# The Docker engine (colima) is left running so other projects keep working.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

say()  { printf '%s\n' "$*"; }
ok()   { printf '  ✅ %s\n' "$*"; }
bad()  { printf '  ⚠️  %s\n' "$*"; }
step() { printf '\n▶ %s\n' "$*"; }

say "════════════════════════════════════════════════════════"
say "  WITHIN REACH — Leeds · CLOSE SERVER"
say "════════════════════════════════════════════════════════"

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

step "1/4 Web app (port 5173)"
PIDS=$(lsof -tiTCP:5173 -sTCP:LISTEN 2>/dev/null)
if [ -n "$PIDS" ]; then kill $PIDS 2>/dev/null && ok "Web app stopped"; else ok "Already stopped"; fi

step "2/4 API server (port 8000)"
if pkill -f "uvicorn services.api.app.main" 2>/dev/null; then ok "API stopped"; else ok "Already stopped"; fi

step "3/4 Valhalla router"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "wr-valhalla-service"; then
  docker stop wr-valhalla-service > /dev/null 2>&1 && ok "Valhalla stopped"
else
  ok "Already stopped"
fi

step "4/4 PostGIS database"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "within_reach_leeds-db-1"; then
  docker stop within_reach_leeds-db-1 > /dev/null 2>&1 && ok "PostGIS stopped" || bad "could not stop PostGIS"
else
  ok "Already stopped"
fi

say ""
say "════════════════════════════════════════════════════════"
say "  🛑 WITHIN REACH servers stopped."
say "  ℹ️  The Docker engine (colima) is still running for other apps."
say "     To stop it too, run in Terminal:  colima stop"
say "  ▶ To start again: double-click  START SERVER (Debug).command"
say "════════════════════════════════════════════════════════"
exit 0
