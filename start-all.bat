@echo off
title Adda Communication Platform — All Services
color 0A
cls

echo.
echo  ================================================================
echo  ^|          ADDA COMMUNICATION PLATFORM v2.0                    ^|
echo  ^|         Smart Conversation, Anywhere.                        ^|
echo  ================================================================
echo.

:: Kill old processes
echo [1/4] Stopping previous instances...
taskkill /F /IM uvicorn.exe 2>nul
taskkill /F /IM python.exe 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul

:: Start FastAPI Backend
echo [2/4] Starting Adda Backend (FastAPI)...
cd /d "%~dp0\backend"
start "Adda Backend" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 4 /nobreak >nul

:: Start Next.js Frontend
echo [3/4] Starting Adda Frontend (Next.js)...
cd /d "%~dp0\web"
start "Adda Frontend" cmd /k "npm run dev"
timeout /t 6 /nobreak >nul

:: Start Cloudflare Tunnel and capture URL
echo [4/4] Starting Cloudflare Tunnel (Public Internet Access)...
cd /d "%~dp0"

:: Remove old tunnel_url.txt
if exist "backend\tunnel_url.txt" del "backend\tunnel_url.txt"

:: Start cloudflared and capture output to a temp log
start "Adda Tunnel" cmd /k "cloudflared.exe tunnel --url http://127.0.0.1:3000 2>&1 | tee cloudflared_output.log"

:: Wait for tunnel URL to appear
echo Waiting for public tunnel URL...
set TUNNEL_URL=
:wait_for_url
timeout /t 3 /nobreak >nul
if exist "cloudflared_output.log" (
    for /f "tokens=*" %%i in ('type "cloudflared_output.log" ^| findstr "trycloudflare.com"') do (
        echo %%i | findstr /r "https://[a-z]" > nul && (
            for /f "tokens=2 delims= " %%j in ('echo %%i ^| findstr /r "https://"') do (
                set TUNNEL_URL=%%j
            )
        )
    )
)

if "%TUNNEL_URL%"=="" (
    echo Still waiting...
    goto wait_for_url
)

:: Save tunnel URL to file
echo %TUNNEL_URL% > "backend\tunnel_url.txt"
echo.
echo  ================================================================
echo  ^|   PUBLIC LIVE LINK (Share this with anyone!):               ^|
echo  ^|   %TUNNEL_URL%
echo  ================================================================
echo.
echo  Local URLs:
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo.
echo  Scan the QR code in the app sidebar to connect from any device.
echo.

:: Open browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

pause
