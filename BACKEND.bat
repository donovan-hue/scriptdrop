@echo off
cd /d e:\kronos\super-app\server

cls
color 0B
echo.
echo ════════════════════════════════════════════════
echo   BACKEND - Puerto 5000
echo ════════════════════════════════════════════════
echo.
echo Iniciando servidor con autenticación...
echo.

node server-inmemory.js

pause
