#!/usr/bin/env powershell
# Installation script with aggressive npm configuration

Write-Host "🔧 INSTALACIÓN AGRESIVA - INTENTANDO RESOLVER npm" -ForegroundColor Cyan
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Kill all npm and node processes
Write-Host "1️⃣  Limpiando procesos anteriores..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null
Start-Sleep -Seconds 2

# Reset npm completely
Write-Host "2️⃣  Reseteando npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
npm config set fetch-timeout 120000 2>$null
npm config set fetch-retry-mintimeout 60000 2>$null
npm config set fetch-retry-maxtimeout 120000 2>$null
npm config set progress false 2>$null
npm config set loglevel warn 2>$null

# Try alternative registry
Write-Host "3️⃣  Usando registry alternativo..." -ForegroundColor Yellow
npm config set registry https://registry.npmmirror.com/ 2>$null

# Server installation with timeout
Write-Host "`n4️⃣  Instalando servidor (timeout: 15 minutos)..." -ForegroundColor Yellow
Push-Location "E:\kronos\super-app\server"

# Try with npm ci first (cleaner)
Write-Host "   Intentando npm ci (método limpio)..." -ForegroundColor Gray
npm ci --legacy-peer-deps --no-audit 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   npm ci falló, intentando npm install..." -ForegroundColor Gray
    npm install --legacy-peer-deps --no-audit --omit=dev 2>&1
}

$serverSuccess = $LASTEXITCODE -eq 0
Pop-Location

if ($serverSuccess) {
    Write-Host "   ✅ Servidor instalado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error en servidor" -ForegroundColor Red
}

# Client installation with timeout
Write-Host "`n5️⃣  Instalando cliente (timeout: 15 minutos - puede ser lento)..." -ForegroundColor Yellow
Push-Location "E:\kronos\super-app\client"

Write-Host "   Intentando npm ci (método limpio)..." -ForegroundColor Gray
npm ci --legacy-peer-deps --no-audit 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   npm ci falló, intentando npm install..." -ForegroundColor Gray
    npm install --legacy-peer-deps --no-audit 2>&1
}

$clientSuccess = $LASTEXITCODE -eq 0
Pop-Location

if ($clientSuccess) {
    Write-Host "   ✅ Cliente instalado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error en cliente" -ForegroundColor Red
}

# Reset registry
Write-Host "`n6️⃣  Reseteando registry a npm oficial..." -ForegroundColor Yellow
npm config set registry https://registry.npmjs.org/ 2>$null

# Summary
Write-Host "`n════════════════════════════════════════════════════════════════=" -ForegroundColor Cyan
if ($serverSuccess -and $clientSuccess) {
    Write-Host "✅ ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "`nPróximos pasos:" -ForegroundColor Green
    Write-Host "  1. Abre 2 terminales" -ForegroundColor White
    Write-Host "  2. Terminal 1: cd server && npm run dev" -ForegroundColor White
    Write-Host "  3. Terminal 2: cd client && npm start" -ForegroundColor White
} else {
    Write-Host "❌ ERRORES EN INSTALACIÓN" -ForegroundColor Red
    Write-Host "   Servidor: $(if ($serverSuccess) { '✅' } else { '❌' })" -ForegroundColor $(if ($serverSuccess) { 'Green' } else { 'Red' })
    Write-Host "   Cliente:  $(if ($clientSuccess) { '✅' } else { '❌' })" -ForegroundColor $(if ($clientSuccess) { 'Green' } else { 'Red' })
}

Write-Host "`n" -ForegroundColor Cyan
