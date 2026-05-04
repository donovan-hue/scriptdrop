@echo off
REM ═══════════════════════════════════════════════════════════════════
REM  SUPER-APP - SCRIPT DE INICIO RÁPIDO
REM ═══════════════════════════════════════════════════════════════════

echo.
echo ╔═════════════════════════════════════════════════════════════════╗
echo ║         🚀 INICIANDO SUPER-APP - PROYECTO COMPLETO            ║
echo ╚═════════════════════════════════════════════════════════════════╝
echo.

REM Verificar que estamos en el directorio correcto
if not exist package.json (
    echo ❌ ERROR: package.json no encontrado
    echo Asegúrate de ejecutar este script desde la raíz del proyecto
    pause
    exit /b 1
)

echo ✅ Proyecto detectado

REM Verificar Node.js
echo.
echo 1️⃣  Verificando Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo Descargarlo desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM Verificar npm
echo.
echo 2️⃣  Verificando npm...
npm --version
if errorlevel 1 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)
echo ✅ npm OK

REM Verificar carpetas necesarias
echo.
echo 3️⃣  Verificando estructura...
if not exist server (
    echo ❌ Carpeta /server no encontrada
    pause
    exit /b 1
)
if not exist client (
    echo ❌ Carpeta /client no encontrada
    pause
    exit /b 1
)
echo ✅ Estructura OK

REM Verificar .env
echo.
echo 4️⃣  Verificando configuración...
if not exist server\.env (
    echo ⚠️  ADVERTENCIA: No se encontró server\.env
    echo    Copiando desde server\.env.example...
    if exist server\.env.example (
        copy server\.env.example server\.env
        echo ✅ .env creado (actualiza con tus credenciales)
    ) else (
        echo ❌ No hay .env.example tampoco
        pause
        exit /b 1
    )
)
echo ✅ Configuración OK

REM Verificar node_modules
echo.
echo 5️⃣  Verificando dependencias...
if not exist server\node_modules (
    echo ⚠️  node_modules no encontrado en /server
    echo    Instalando...
    cd server
    call npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Error al instalar server dependencies
        pause
        exit /b 1
    )
)
echo ✅ Server dependencies OK

if not exist client\node_modules (
    echo ⚠️  node_modules no encontrado en /client
    echo    Instalando...
    cd client
    call npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Error al instalar client dependencies
        pause
        exit /b 1
    )
)
echo ✅ Client dependencies OK

REM Todo OK - mostrar instrucciones finales
echo.
echo ╔═════════════════════════════════════════════════════════════════╗
echo ║            ✅ VERIFICACIÓN COMPLETADA - TODO OK                ║
echo ╚═════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 PARA EJECUTAR EL PROYECTO:
echo.
echo OPCIÓN 1 - Dos terminales (RECOMENDADO):
echo   Terminal 1: cd server ^&^& node server.js
echo   Terminal 2: cd client ^&^ npm start
echo.
echo OPCIÓN 2 - Ejecutar ambos (experimental):
echo   npm run dev
echo.
echo 🌐 Una vez iniciado, abre: http://localhost:3000
echo.
echo 📝 NOTAS:
echo   - Backend corre en: http://localhost:5000
echo   - Frontend corre en: http://localhost:3000
echo   - API Health check: http://localhost:5000/api/health
echo.
pause
