# ════════════════════════════════════════════════════════
# SUPER-APP - PowerShell Start Script
# ════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         SUPER-APP v1.0.0 - Starting Project           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check server dependencies
if (-not (Test-Path "server\node_modules")) {
    Write-Host "⏳ Installing server dependencies..." -ForegroundColor Yellow
    Push-Location server
    npm install --legacy-peer-deps
    Pop-Location
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
}

# Check client dependencies
if (-not (Test-Path "client\node_modules")) {
    Write-Host "⏳ Installing client dependencies..." -ForegroundColor Yellow
    Push-Location client
    npm install --legacy-peer-deps
    Pop-Location
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All dependencies ready" -ForegroundColor Green
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SELECT HOW TO START THE PROJECT                       ║" -ForegroundColor Cyan
Write-Host "║  1. Backend only (port 5000)                           ║" -ForegroundColor Cyan
Write-Host "║  2. Frontend only (port 3000)                          ║" -ForegroundColor Cyan
Write-Host "║  3. Both backend and frontend                          ║" -ForegroundColor Cyan
Write-Host "║  4. Exit                                               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Green
        Push-Location server
        npm start
        Pop-Location
    }
    "2" {
        Write-Host "`n🚀 Starting Frontend Application..." -ForegroundColor Green
        Push-Location client
        npm start
        Pop-Location
    }
    "3" {
        Write-Host "`n🚀 Starting Backend in background..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm start"
        
        Start-Sleep -Seconds 3
        
        Write-Host "🚀 Starting Frontend in new window..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm start"
        
        Write-Host "`n✅ Both processes started!" -ForegroundColor Green
        Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
    }
    default {
        Write-Host "Exiting..." -ForegroundColor Yellow
    }
}
