@echo off
cd /d e:\kronos\super-app

cls
color 0A
title SUPER-APP - Iniciando...

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     SUPER-APP v1.0.0 - INICIANDO PROYECTO             ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando Backend (Terminal 1)...
echo 🚀 Iniciando Frontend (Terminal 2)...
echo.

start "Backend - 5000" cmd /k "cd server && npm start"
timeout /t 2 /nobreak
start "Frontend - 3000" cmd /k "cd client && npm start"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        ✅ TERMINALES ABIERTAS                          ║
echo ║                                                        ║
echo ║   Backend:  http://localhost:5000/api/health          ║
echo ║   Frontend: http://localhost:3000                     ║
echo ║                                                        ║
echo ║   Espera 30-60 segundos para que carguen              ║
echo ║   Presiona Ctrl+C para detener                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
pause
