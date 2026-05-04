@echo off
REM ═══════════════════════════════════════════════════════════════
REM SUPER-APP INSTALLATION SCRIPT (Windows)
REM One-liner para instalar todo rápidamente
REM ═══════════════════════════════════════════════════════════════

echo.
echo 🚀 Super-App Installation Script (Windows)
echo ═══════════════════════════════════════════════════════════════
echo.

REM Paso 1: Verificar Node.js
echo 1️⃣  Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js
node --version
echo ✓ npm
npm --version

REM Paso 2: Verificar Git
echo.
echo 2️⃣  Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git no está instalado
    echo Descarga desde: https://git-scm.com/
    pause
    exit /b 1
)
echo ✓ Git
git --version

REM Paso 3: Crear .env si no existe
echo.
echo 3️⃣  Configurando .env...
if not exist .env (
    copy .env.example .env
    echo ✓ Archivo .env creado
    echo ⚠️  EDITA .env con tus credenciales:
    echo    - MONGODB_URI
    echo    - STRIPE_PUBLIC_KEY y STRIPE_SECRET_KEY
    echo    - CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
    echo    - JWT_SECRET
) else (
    echo ✓ .env ya existe
)

REM Paso 4: Instalar dependencias server
echo.
echo 4️⃣  Instalando dependencias del Backend...
cd server
echo    Instalando paquetes...
call npm install
if errorlevel 1 (
    echo ❌ Error en instalación del backend
    cd ..
    pause
    exit /b 1
)
echo ✓ Backend instalado
cd ..

REM Paso 5: Instalar dependencias client
echo.
echo 5️⃣  Instalando dependencias del Frontend...
cd client
echo    Instalando paquetes...
call npm install
if errorlevel 1 (
    echo ❌ Error en instalación del frontend
    cd ..
    pause
    exit /b 1
)
echo ✓ Frontend instalado
cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ Instalación completada!
echo.
echo Próximos pasos:
echo.
echo 1. EDITA .env con tus credenciales:
echo    - MONGODB_URI ^(de MongoDB Atlas^)
echo    - STRIPE keys ^(de Stripe^)
echo    - CLOUDINARY keys ^(de Cloudinary^)
echo    - JWT_SECRET ^(genera con: openssl rand -base64 32^)
echo.
echo 2. INICIA los servicios ^(en 2 terminales^):
echo    Terminal 1: cd server ^&^& npm run dev
echo    Terminal 2: cd client ^&^& npm start
echo.
echo 3. ACCEDE: http://localhost:3000
echo.
echo Para más info: ver INSTALLATION.md o DEPLOYMENT.md
echo ═══════════════════════════════════════════════════════════════
echo.
pause
