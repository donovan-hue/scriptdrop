@echo off
REM Clean reinstall script

echo.
echo Limpiando node_modules...
cd /d E:\kronos\super-app\server
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Limpiando npm cache...
call npm cache clean --force

echo.
echo Instalando dependencias (primera vez)...
call npm install --legacy-peer-deps --force

echo.
if exist node_modules\express (
    echo ✓ Express instalado correctamente
) else (
    echo ✗ Express aún no está instalado
)

echo.
echo Intentando iniciar servidor...
call node server.js

pause
