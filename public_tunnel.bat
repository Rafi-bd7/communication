@echo off
title Adda Public Tunnel Launcher
echo ========================================================
echo        Adda - Instant Public Live Link Launcher
echo ========================================================
echo.
echo Starting secure HTTPS public tunnel for port 3000...
echo.
echo You will see your live public URL below (e.g. https://xxxx.lhr.life):
echo Share this link with anyone across the country to join Adda!
echo.
echo Press Ctrl+C anytime to stop the tunnel.
echo ========================================================
echo.
ssh -o StrictHostKeyChecking=no -R 80:127.0.0.1:3000 nokey@localhost.run
pause
