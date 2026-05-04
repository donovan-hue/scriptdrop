#!/usr/bin/env pwsh

Write-Host "🚀 Instalando dependencias del servidor..." -ForegroundColor Cyan

# Instalar servidor
Push-Location "$PSScriptRoot\server"
Write-Host "📦 Instalando dependencias del servidor en: $(Get-Location)" -ForegroundColor Yellow

$procServer = Start-Process npm -ArgumentList "install" -NoNewWindow -PassThru

Write-Host "⏳ Esperando que se complete la instalación del servidor (esto puede tomar 5-10 minutos)..."
$procServer.WaitForExit()
$exitCodeServer = $procServer.ExitCode

if ($exitCodeServer -eq 0) {
    Write-Host "✅ Servidor instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando servidor (código: $exitCodeServer)" -ForegroundColor Red
}

Pop-Location

Write-Host "`n🚀 Instalando dependencias del cliente..." -ForegroundColor Cyan

# Instalar cliente
Push-Location "$PSScriptRoot\client"
Write-Host "📦 Instalando dependencias del cliente en: $(Get-Location)" -ForegroundColor Yellow

$procClient = Start-Process npm -ArgumentList "install" -NoNewWindow -PassThru

Write-Host "⏳ Esperando que se complete la instalación del cliente (esto puede tomar 10-15 minutos)..."
$procClient.WaitForExit()
$exitCodeClient = $procClient.ExitCode

if ($exitCodeClient -eq 0) {
    Write-Host "✅ Cliente instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando cliente (código: $exitCodeClient)" -ForegroundColor Red
}

Pop-Location

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 RESUMEN DE INSTALACIÓN:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Servidor: $(if ($exitCodeServer -eq 0) { '✅ OK' } else { '❌ ERROR' })" -ForegroundColor $(if ($exitCodeServer -eq 0) { 'Green' } else { 'Red' })
Write-Host "Cliente:  $(if ($exitCodeClient -eq 0) { '✅ OK' } else { '❌ ERROR' })" -ForegroundColor $(if ($exitCodeClient -eq 0) { 'Green' } else { 'Red' })

if ($exitCodeServer -eq 0 -and $exitCodeClient -eq 0) {
    Write-Host "`n🎉 ¡Instalación completada exitosamente!" -ForegroundColor Green
    Write-Host "`nPara iniciar el proyecto, ejecuta:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Algunas instalaciones fallaron. Verifica los logs anterior para más detalles." -ForegroundColor Red
}
