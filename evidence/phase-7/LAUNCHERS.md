# Double-click launchers (2026-09-06)

Project root now contains four double-click launchers:

| File | Platform | Does |
|---|---|---|
| `START SERVER (Debug).command` | macOS | colima (if needed) → PostGIS → Valhalla → API :8000 → Web :5173; green/red status per step; logs in `.runtime/logs/` |
| `CLOSE SERVER.command` | macOS | stops web, API, Valhalla, PostGIS (colima left running) |
| `START SERVER (Debug).bat` | Windows | same stack; API/web run in visible cmd windows (debug); one-time setup hints if venv/pnpm missing |
| `CLOSE SERVER.bat` | Windows | stops by listening-port PIDs + container names |

Verified live (macOS): CLOSE → all four ports down; cold START → 8/8 checks green; API meta serves all releases (12,507 places); web 200; Valhalla isochrone OK.

Robustness lessons baked in (found during testing):
1. Port detection must filter LISTEN state (`lsof -tiTCP:PORT -sTCP:LISTEN`) — plain `lsof -ti :PORT` matches client sockets and caused false "already running".
2. Background servers started with `nohup … & disown` at script top level survive window close; subshell `( … & disown )` did not.
3. DB readiness is checked over TCP from the host, not `docker exec` (works even when the VM's runc is unhappy; also immune to container healthcheck metadata).
4. During testing the colima VM wedged (host disk 99% full → containerd I/O errors, stale "Up 28 hours" metadata). Recovery: freed safe caches, removed a stale WR_DOCKER mount from colima.yaml (leftover probe), `colima start`. A stale `WR_DOCKER` mount in colima.yaml makes the VM unbootable when that volume is not attached.
