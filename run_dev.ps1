# Adda - Smart Conversation, Anywhere.
# Web-First Communication Platform - Development Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Starting Adda Communication Platform               " -ForegroundColor Cyan
Write-Host "       Smart Conversation, Anywhere.                     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Detect Local LAN IP for Phone/Cross-Device Access
$lanIp = "127.0.0.1"
try {
    $lanIp = (python -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); print(s.getsockname()[0]); s.close()")
} catch {
    $lanIp = "localhost"
}

# 1. Start Backend
Write-Host "`n[1/2] Starting FastAPI Backend on 0.0.0.0:8000..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$baseDir\backend" -ArgumentList "-NoExit", "-Command", "python run.py"

# 2. Start Frontend
Write-Host "[2/2] Starting Next.js Frontend on 0.0.0.0:3000..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$baseDir\web" -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "              Adda Platform is Running!                   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`n[*] On THIS Computer:" -ForegroundColor Yellow
Write-Host "   Web App:  http://localhost:3000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White

Write-Host "`n[*] On MOBILE PHONE or ANOTHER DEVICE (Same Wi-Fi):" -ForegroundColor Cyan
Write-Host "   Open URL: http://$($lanIp):3000" -ForegroundColor Yellow

Write-Host "`n[*] Registration & Testing:" -ForegroundColor Cyan
Write-Host "   - Register your own account: http://localhost:3000/register" -ForegroundColor White
Write-Host "   - Or open http://$($lanIp):3000 on your phone to test cross-device real-time chat!" -ForegroundColor Yellow
Write-Host "==========================================================`n" -ForegroundColor Green
