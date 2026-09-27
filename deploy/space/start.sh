#!/usr/bin/env bash
set -euo pipefail
# Router first (serves :8002 in-container), then the API on the Space port.
valhalla_service /custom_files/config.json 1 &
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-7860}" --app-dir /app
