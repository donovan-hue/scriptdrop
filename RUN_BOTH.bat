@echo off
REM ====================================================
REM    SUPER-APP - EJECUTOR COMPLETO
REM ====================================================
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║         SUPER-APP v1.0.0 - Full Start                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exist
if not exist "server\node_modules" (
    echo ⏳ Installing server dependencies...
    cd server
    call npm install --legacy-peer-deps
    cd ..
    echo ✅ Server dependencies installed
)

if not exist "client\node_modules" (
    echo ⏳ Installing client dependencies...
    cd client
    call npm install --legacy-peer-deps
    cd ..
    echo ✅ Client dependencies installed
)

echo.
echo ✅ All dependencies ready
echo.
echo 🚀 Starting backend server...
start cmd /k "cd server && npm start"

timeout /t 3 /nobreak

echo 🚀 Starting frontend application...
start cmd /k "cd client && npm start"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                PROJECT STARTED                         ║
echo ║  Backend:  http://localhost:5000/api/health            ║
echo ║  Frontend: http://localhost:3000                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo ✅ Two terminals have opened above - do NOT close this window
pause
