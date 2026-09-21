@echo off
title Adda Public Tunnel Launcher
echo ========================================================
echo        Adda - Instant Public Live Link Launcher
echo ========================================================
echo.
echo Starting secure HTTPS public tunnel for port 3000...
echo.
echo Keep this window OPEN while you want anyone to access Adda online.
echo Press Ctrl+C anytime to stop the tunnel.
echo ========================================================
echo.

:loop
echo [Connecting to secure public tunnel...]
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=5 -R 80:127.0.0.1:3000 nokey@localhost.run
echo Tunnel disconnected. Reconnecting in 3 seconds...
timeout /t 3 /nobreak >nul
goto loop
