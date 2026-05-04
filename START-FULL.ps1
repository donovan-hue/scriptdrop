# ════════════════════════════════════════════════════════
# QUICK START - Solo Backend y Frontend
# ════════════════════════════════════════════════════════

$rootPath = Get-Location

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    SUPER-APP - Full Stack Start (Backend + Frontend)   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Ensure dependencies
Write-Host "`nVerifying dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing server..." -ForegroundColor Yellow
    cd server; npm install --legacy-peer-deps; cd ..
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing client..." -ForegroundColor Yellow
    cd client; npm install --legacy-peer-deps; cd ..
}

Write-Host "`n✅ Ready to start!" -ForegroundColor Green

# Start Backend
Write-Host "`n🚀 Starting Backend Server (Terminal 1)..." -ForegroundColor Cyan
$backendCmd = "cd '$rootPath\server'; npm start; pause"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Wait for backend to initialize
Start-Sleep -Seconds 4

# Start Frontend
Write-Host "🚀 Starting Frontend (Terminal 2)..." -ForegroundColor Cyan
$frontendCmd = "cd '$rootPath\client'; npm start; pause"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║✅ PROJECT STARTED SUCCESSFULLY                         ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║  Backend:  http://localhost:5000/api/health           ║" -ForegroundColor Green
Write-Host "║  Frontend: http://localhost:3000                      ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║  Two new terminals opened above ↑                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nℹ️  Press Ctrl+C in terminal 1 to stop backend" -ForegroundColor Gray
Write-Host "ℹ️  Press Ctrl+C in terminal 2 to stop frontend" -ForegroundColor Gray
