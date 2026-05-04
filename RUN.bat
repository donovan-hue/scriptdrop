@echo off
REM ====================================================
REM    SUPER-APP - EJECUTOR DE PROYECTO
REM ====================================================
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║         SUPER-APP v1.0.0 - Starting Project           ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exist
if not exist "server\node_modules" (
    echo ❌ Server dependencies missing
    echo Installing server dependencies...
    cd server
    call npm install --legacy-peer-deps
    cd ..
)

if not exist "client\node_modules" (
    echo ❌ Client dependencies missing
    echo Installing client dependencies...
    cd client
    call npm install --legacy-peer-deps
    cd ..
)

echo.
echo ✅ Dependencies verified
echo.
echo Starting project in two windows...
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  BACKEND (Terminal 1): http://localhost:5000           ║
echo ║  FRONTEND (Terminal 2): http://localhost:3000          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Open server terminal
cmd /k "cd server && npm start"
