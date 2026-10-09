@echo off
title Adda Communication Platform — All Services
color 0A
cls

echo.
echo  ================================================================
echo  ^|          ADDA COMMUNICATION PLATFORM v2.0                    ^|
echo  ^|         Smart Conversation, Anywhere in the World.           ^|
echo  ================================================================
echo.

:: Kill old processes
echo [1/5] Stopping previous instances...
taskkill /F /IM uvicorn.exe 2>nul
taskkill /F /IM cloudflared.exe 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" 2^>nul') do ( taskkill /F /PID %%a 2>nul )
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" 2^>nul') do ( taskkill /F /PID %%a 2>nul )
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" 2^>nul') do ( taskkill /F /PID %%a 2>nul )
timeout /t 2 /nobreak >nul

:: Start FastAPI Backend (Port 8000)
echo [2/5] Starting Adda Backend (FastAPI on Port 8000)...
cd /d "%~dp0backend"
start "Adda Backend (8000)" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

:: Start Next.js Frontend (Port 3001)
echo [3/5] Starting Adda Next.js Web (Port 3001)...
cd /d "%~dp0web"
start "Adda Next.js (3001)" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul

:: Start Unified Gateway (Port 3000)
echo [4/5] Starting Adda Gateway (Port 3000)...
cd /d "%~dp0"
start "Adda Gateway (3000)" cmd /k "node gateway.js"
timeout /t 2 /nobreak >nul

:: Clean old logs
if exist "%~dp0cloudflared.log" del "%~dp0cloudflared.log"
if exist "%~dp0backend\tunnel_url.txt" del "%~dp0backend\tunnel_url.txt"
if exist "%~dp0tunnel_url.txt" del "%~dp0tunnel_url.txt"

:: Start Cloudflare Tunnel (Pointing to Gateway Port 3000)
echo [5/5] Starting Cloudflare Tunnel for Worldwide Internet Access...
start "Adda Tunnel" /min "%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:3000 --logfile "%~dp0cloudflared.log"

:: Wait for tunnel URL to generate
echo Waiting for Public HTTPS Link...
set TUNNEL_URL=
set ATTEMPTS=0

:wait_for_url
timeout /t 2 /nobreak >nul
set /a ATTEMPTS+=1

for /f "usebackq tokens=*" %%u in (`powershell -NoProfile -Command "$log = '%~dp0cloudflared.log'; if (Test-Path $log) { $txt = Get-Content $log -Raw; if ($txt -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') { $matches[0] } }"`) do (
    set TUNNEL_URL=%%u
)

if "%TUNNEL_URL%"=="" (
    if %ATTEMPTS% LSS 15 (
        echo Connecting to global network... (attempt %ATTEMPTS%/15)
        goto wait_for_url
    )
)

if not "%TUNNEL_URL%"=="" (
    echo %TUNNEL_URL% > "%~dp0backend\tunnel_url.txt"
    echo %TUNNEL_URL% > "%~dp0tunnel_url.txt"
)

echo.
echo  ================================================================
if not "%TUNNEL_URL%"=="" (
    echo  ^|  PUBLIC LIVE HTTPS LINK (Works on Mobile Data / Anywhere!):
    echo  ^|  %TUNNEL_URL%
) else (
    echo  ^|  Tunnel is initializing in the background.
    echo  ^|  Check cloudflared.log for your live link.
)
echo  ================================================================
echo.
echo  Local Network URLs:
echo   Local PC : http://localhost:3000
echo   WiFi LAN : Check Device Connect in App Sidebar
echo.
echo  Now opening browser...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo All services are running! Keep this window open.
pause
