# ════════════════════════════════════════════════════════
# Quick Frontend Only Start
# ════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         FRONTEND APPLICATION ONLY                     ║" -ForegroundColor Cyan
Write-Host "║         http://localhost:3000                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if (-not (Test-Path "client\node_modules")) {
    Write-Host "`nℹ️  Installing dependencies (first time)..." -ForegroundColor Yellow
    cd client; npm install --legacy-peer-deps; cd ..
}

Write-Host "`n🚀 Starting frontend..." -ForegroundColor Green
cd client
npm start
