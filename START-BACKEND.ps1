# ════════════════════════════════════════════════════════
# Quick Backend Only Start
# ════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         BACKEND SERVER ONLY                           ║" -ForegroundColor Cyan
Write-Host "║         http://localhost:5000                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if (-not (Test-Path "server\node_modules")) {
    Write-Host "`nℹ️  Installing dependencies (first time)..." -ForegroundColor Yellow
    cd server; npm install --legacy-peer-deps; cd ..
}

Write-Host "`n🚀 Starting server..." -ForegroundColor Green
cd server
npm start
