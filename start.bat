@echo off
title Adda Platform Launcher
echo ========================================================
echo        Adda - Smart Conversation, Anywhere.
echo        Bangla-First Communication Platform
echo ========================================================
echo.

REM Detect Local LAN IP for Phone/Cross-Device Access
set LAN_IP=127.0.0.1
for /f "tokens=*" %%i in ('python -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); print(s.getsockname()[0]); s.close()" 2^>nul') do set LAN_IP=%%i

echo [1/2] Starting Python FastAPI Backend on 0.0.0.0:8000...
start "Adda Backend" cmd /k "cd /d %~dp0backend && python run.py"

echo [2/2] Starting Next.js Web App on 0.0.0.0:3000...
start "Adda Frontend" cmd /k "cd /d %~dp0web && npm run dev"

echo.
echo ========================================================
echo                 Adda Platform is Running!
echo ========================================================
echo.
echo  * On THIS Computer (Desktop/Laptop):
echo     Web App:      http://localhost:3000
echo     API Docs:     http://localhost:8000/docs
echo.
echo  * On MOBILE PHONE or ANOTHER DEVICE (Same Wi-Fi):
echo     Open Browser: http://%LAN_IP%:3000
echo.
echo  * Registration & Login:
echo     - Register your own real name and photo at: http://localhost:3000/register
echo     - Or login with existing credentials.
echo.
echo  * How to test between 2 devices:
echo     1. Open http://localhost:3000 on your PC and create an account.
echo     2. Open http://%LAN_IP%:3000 on your Phone (same Wi-Fi) and create another account.
echo     3. Search by username or click Quick Adda to chat in real-time!
echo ========================================================
pause
