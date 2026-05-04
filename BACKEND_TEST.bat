@echo off
cd /d e:\kronos\super-app\server
cls
color 0C
echo.
echo ════════════════════════════════════════════════
echo   BACKEND TEST - Puerto 5000
echo   (Version simple para diagnostico)
echo ════════════════════════════════════════════════
echo.
echo Iniciando servidor de prueba...
echo.

node server-test.js

pause
