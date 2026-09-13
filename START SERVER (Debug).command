#!/usr/bin/env bash
# WITHIN REACH — Leeds: START SERVER (Debug) for macOS
# Double-click this file. It starts the full stack and leaves it running:
#   PostGIS (Docker) -> Valhalla router (Docker) -> API (:8000) -> Web (:5173)
# Logs: .runtime/logs/  ·  To stop everything: double-click "CLOSE SERVER.command"
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.runtime/logs"
mkdir -p "$LOG_DIR"

say()  { printf '%s\n' "$*"; }
ok()   { printf '  ✅ %s\n' "$*"; }
bad()  { printf '  ❌ %s\n' "$*"; }
step() { printf '\n▶ %s\n' "$*"; }

say "════════════════════════════════════════════════════════"
say "  WITHIN REACH — Leeds · START SERVER (Debug)"
say "  Project: $ROOT"
say "════════════════════════════════════════════════════════"

step "1/6 External SSD check"
if [ -d "$ROOT/apps" ] && [ -d "$ROOT/.runtime" ]; then ok "Project folder found"; else bad "Run this from the project root on the SSD"; echo; exit 1; fi

step "2/6 Docker engine (colima)"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
export COREPACK_HOME="$ROOT/.runtime/corepack"
if docker info > /dev/null 2>&1; then
  ok "Docker engine running"
else
  say "  Starting colima (about 30–60 seconds)…"
  if colima start > "$LOG_DIR/colima.log" 2>&1; then ok "colima started"; else bad "colima failed — see $LOG_DIR/colima.log"; fi
fi

step "3/6 PostGIS database (port 5432)"
# Prefer an already-running database and check it over TCP — this works even
# when the Docker image store is unhappy (low-disk machines).
if nc -z 127.0.0.1 5432 > /dev/null 2>&1; then
  ok "Postgres answering on :5432"
else
  if docker compose -f "$ROOT/docker-compose.yml" --project-directory "$ROOT" up -d db > "$LOG_DIR/compose.log" 2>&1; then
    for i in $(seq 1 24); do nc -z 127.0.0.1 5432 > /dev/null 2>&1 && break; sleep 2; done
    nc -z 127.0.0.1 5432 > /dev/null 2>&1 \
      && ok "PostGIS ready" || bad "PostGIS not ready — see $LOG_DIR/compose.log"
  else
    bad "docker compose failed — see $LOG_DIR/compose.log"
  fi
fi

step "4/6 Valhalla router (port 8002)"
if docker ps --format '{{.Names}}' | grep -qx "wr-valhalla-service"; then
  ok "Valhalla already running"
elif docker ps -a --format '{{.Names}}' | grep -qx "wr-valhalla-service"; then
  docker start wr-valhalla-service > /dev/null 2>&1 && ok "Valhalla container started" || bad "could not start Valhalla container"
else
  if [ -f "$ROOT/.runtime/valhalla/config.json" ] && [ -d "$ROOT/.runtime/valhalla/valhalla-tiles" ]; then
    docker run -d --name wr-valhalla-service -p 8002:8002 \
      -v "$ROOT/.runtime/valhalla:/custom_files" \
      ghcr.io/valhalla/valhalla@sha256:a7d0d02ed5ce4f2817105b443eb58494a5757fc6b48780a39c9cc62740296432 \
      valhalla_service /custom_files/config.json 1 > /dev/null 2>&1 \
      && ok "Valhalla started (fresh container)" || bad "Valhalla failed to start"
  else
    bad "No map tiles at .runtime/valhalla — build them first (docs in evidence/phase-4)"
  fi
fi

step "5/6 API server (port 8000)"
if [ -f "$ROOT/.env" ]; then set -a; source "$ROOT/.env"; set +a; else bad ".env missing — API may use defaults"; fi
if lsof -tiTCP:8000 -sTCP:LISTEN > /dev/null 2>&1; then
  ok "API already running on :8000"
else
  if [ -x "$ROOT/.venv/bin/python" ]; then
    cd "$ROOT"
    nohup "$ROOT/.venv/bin/python" -m uvicorn services.api.app.main:app \
      --host 127.0.0.1 --port 8000 > "$LOG_DIR/api.log" 2>&1 &
    disown
    cd - > /dev/null
    for i in $(seq 1 20); do curl -s http://127.0.0.1:8000/healthz | grep -q ok && break; sleep 1; done
    curl -s http://127.0.0.1:8000/healthz | grep -q ok \
      && ok "API running (log: $LOG_DIR/api.log)" || bad "API did not answer — see $LOG_DIR/api.log"
  else
    bad "No .venv found — run setup first (README in evidence/FINAL_ACCEPTANCE_REPORT.md)"
  fi
fi

step "6/6 Web app (port 5173)"
if lsof -tiTCP:5173 -sTCP:LISTEN > /dev/null 2>&1; then
  ok "Web app already running on :5173"
else
  cd "$ROOT"
  nohup pnpm --filter web dev > "$LOG_DIR/web.log" 2>&1 &
  disown
  cd - > /dev/null
  STARTED_WEB=1
  for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:5173/ && break; sleep 2; done
  curl -s -o /dev/null http://localhost:5173/ \
    && ok "Web app running (log: $LOG_DIR/web.log)" || bad "Web app did not answer — see $LOG_DIR/web.log"
fi

say ""
say "════════════════════════════════════════════════════════"
say "  ✅ Open the app:   http://localhost:5173"
say "  ✅ API docs:       http://127.0.0.1:8000/docs"
say "  📋 Logs folder:    .runtime/logs/"
say "  🛑 To stop:        double-click  CLOSE SERVER.command"
say "════════════════════════════════════════════════════════"
say ""

if [ "$STARTED_WEB" = "1" ]; then
  say "Waiting for the web app to be ready, then opening your browser…"
  for i in $(seq 1 45); do
    curl -s -o /dev/null http://localhost:5173/ && break
    sleep 2
  done
fi

if curl -s -o /dev/null http://localhost:5173/; then
  open "http://localhost:5173"
  say "🌐 Your browser should now show WITHIN REACH."
  say "You can close this window — the servers keep running."
else
  say ""
  say "❌ THE WEB PAGE DID NOT START. Most likely causes:"
  say "   1. Your Mac's disk is nearly full (check:  about this Mac > Storage)"
  say "   2. The web log has the real error:  .runtime/logs/web.log"
  say "The window will stay open so you can read the messages above."
  read -r -p "Press Return to close this window…" _
fi
exit 0
