@echo off
REM ============================================================
REM  WITHIN REACH - Leeds : START SERVER (Debug) for Windows
REM  Double-click this file. It starts the full stack and leaves
REM  it running in visible windows:
REM    PostGIS (Docker) - Valhalla router (Docker) - API (:8000) - Web (:5173)
REM  To stop everything: double-click "CLOSE SERVER.bat"
REM ============================================================
setlocal enabledelayedexpansion
title WITHIN REACH - START SERVER (Debug)

set "ROOT=%~dp0"
set "LOGS=%ROOT%.runtime\logs"
if not exist "%LOGS%" mkdir "%LOGS%"

echo ============================================================
echo   WITHIN REACH - Leeds . START SERVER (Debug)
echo   Project: %ROOT%
echo ============================================================

echo.
echo [1/6] External SSD check
if not exist "%ROOT%apps" (
    echo   [X] Run this .bat from the project root on the SSD.
    goto :done_bad
)
echo   [OK] Project folder found

echo.
echo [2/6] Docker engine
docker info >nul 2>&1
if errorlevel 1 (
    echo   [X] Docker is not running.
    echo       Start "Docker Desktop" from the Start menu, wait for it to
    echo       finish loading, then run this file again.
    goto :done_bad
)
echo   [OK] Docker engine running

echo.
echo [3/6] PostGIS database (port 5432)
docker compose -f "%ROOT%docker-compose.yml" --project-directory "%ROOT%." up -d db
if errorlevel 1 (
    echo   [X] docker compose failed - see messages above.
) else (
    timeout /t 8 /nobreak >nul
    echo   [OK] PostGIS started
)

echo.
echo [4/6] Valhalla router (port 8002)
docker ps --format "{{.Names}}" | findstr /x "wr-valhalla-service" >nul
if !errorlevel! equ 0 (
    echo   [OK] Valhalla already running
) else (
    docker ps -a --format "{{.Names}}" | findstr /x "wr-valhalla-service" >nul
    if !errorlevel! equ 0 (
        docker start wr-valhalla-service >nul 2>&1
        echo   [OK] Valhalla container started
    ) else (
        if exist "%ROOT%.runtime\valhalla\config.json" (
            docker run -d --name wr-valhalla-service -p 8002:8002 -v "%ROOT%.runtime\valhalla:/custom_files" ghcr.io/valhalla/valhalla@sha256:a7d0d02ed5ce4f2817105b443eb58494a5757fc6b48780a39c9cc62740296432 valhalla_service /custom_files/config.json 1 >nul 2>&1
            echo   [OK] Valhalla started ^(fresh container^)
        ) else (
            echo   [!] No map tiles at .runtime\valhalla - build them first
            echo       ^(see evidence\phase-4 in the project docs^)
        )
    )
)

echo.
echo [5/6] API server (port 8000)
curl -s http://127.0.0.1:8000/healthz | findstr /c:"ok" >nul
if !errorlevel! equ 0 (
    echo   [OK] API already running on :8000
) else (
    if exist "%ROOT%.venv\Scripts\python.exe" (
        start "WITHIN REACH API (debug)" cmd /k "cd /d "%ROOT%" && .venv\Scripts\python.exe -m uvicorn services.api.app.main:app --host 127.0.0.1 --port 8000"
        echo   [OK] API started in its own window ^(leave it open; closing that window stops the API^)
    ) else (
        echo   [X] No .venv found. One-time setup:
        echo       1. open Terminal in this folder
        echo       2. python -m venv .venv
        echo       3. .venv\Scripts\pip install -e .
    )
)

echo.
echo [6/6] Web app (port 5173)
curl -s -o nul http://localhost:5173/
if !errorlevel! equ 0 (
    echo   [OK] Web app already running on :5173
) else (
    where pnpm >nul 2>&1
    if !errorlevel! neq 0 (
        echo   [X] pnpm not found. One-time setup: install Node.js, then run
        echo       "corepack enable pnpm" in a Terminal.
    ) else (
        start "WITHIN REACH WEB (debug)" cmd /k "cd /d "%ROOT%" && pnpm --filter web dev"
        echo   [OK] Web app started in its own window
        timeout /t 6 /nobreak >nul
    )
)

echo.
echo Waiting for the web app, then opening your browser...
set /a TRIES=0
:waitweb
curl -s -o nul http://localhost:5173/
if !errorlevel! equ 0 goto openweb
set /a TRIES+=1
if !TRIES! lss 30 (
    timeout /t 2 /nobreak >nul
    goto waitweb
)
echo   [X] THE WEB PAGE DID NOT START. Most likely causes:
echo       1. Docker was not fully started before step 3
echo       2. Your disk is nearly full
echo       3. Check the "WITHIN REACH WEB (debug)" window for the real error
echo.
pause
exit /b 1

:openweb
start "" http://localhost:5173
echo   [OK] Your browser should now show WITHIN REACH.
echo.
echo ============================================================
echo   App    :  http://localhost:5173
echo   Docs   :  http://127.0.0.1:8000/docs
echo   To stop:  double-click  CLOSE SERVER.bat
echo ============================================================

:done_ok
echo.
pause
exit /b 0

:done_bad
echo.
pause
exit /b 1
