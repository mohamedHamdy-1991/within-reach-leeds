@echo off
REM ============================================================
REM  WITHIN REACH - Leeds : CLOSE SERVER for Windows
REM  Double-click this file. Stops the API, web app, Valhalla
REM  and PostGIS. The Docker engine itself is left running.
REM ============================================================
setlocal enabledelayedexpansion
title WITHIN REACH - CLOSE SERVER

echo ============================================================
echo   WITHIN REACH - Leeds . CLOSE SERVER
echo ============================================================

echo.
echo [1/4] Web app (port 5173)
set "FOUND="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /PID %%P /F >nul 2>&1
    set FOUND=1
)
if defined FOUND (echo   [OK] Web app stopped) else (echo   [OK] Already stopped)

echo.
echo [2/4] API server (port 8000)
set "FOUND="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%P /F >nul 2>&1
    set FOUND=1
)
if defined FOUND (echo   [OK] API stopped) else (echo   [OK] Already stopped)

echo.
echo [3/4] Valhalla router
docker ps --format "{{.Names}}" 2>nul | findstr /x "wr-valhalla-service" >nul
if !errorlevel! equ 0 (
    docker stop wr-valhalla-service >nul 2>&1
    echo   [OK] Valhalla stopped
) else (
    echo   [OK] Already stopped
)

echo.
echo [4/4] PostGIS database
docker ps --format "{{.Names}}" 2>nul | findstr "db" >nul
if !errorlevel! equ 0 (
    set "ROOT=%~dp0"
    docker compose -f "!ROOT!docker-compose.yml" --project-directory "!ROOT!." stop db >nul 2>&1
    echo   [OK] PostGIS stopped
) else (
    echo   [OK] Already stopped
)

echo.
echo ============================================================
echo   WITHIN REACH servers stopped.
echo   Docker Desktop itself is still running for other apps.
echo   Start again: double-click  START SERVER (Debug).bat
echo ============================================================
echo.
pause
exit /b 0
