#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# SUPER-APP INSTALLATION SCRIPT
# One-liner para instalar todo rápidamente
# ═══════════════════════════════════════════════════════════════

echo "🚀 Super-App Installation Script"
echo "═══════════════════════════════════════════════════════════════"

# Paso 1: Verificar Node.js
echo ""
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Descarga desde: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js $(node --version)"
echo "✓ npm $(npm --version)"

# Paso 2: Verificar Git
echo ""
echo "2️⃣  Verificando Git..."
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado"
    echo "Descarga desde: https://git-scm.com/"
    exit 1
fi
echo "✓ Git $(git --version)"

# Paso 3: Crear .env si no existe
echo ""
echo "3️⃣  Configurando .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Archivo .env creado"
    echo "⚠️  EDITA .env con tus credenciales:"
    echo "   - MONGODB_URI"
    echo "   - STRIPE_PUBLIC_KEY y STRIPE_SECRET_KEY"
    echo "   - CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET"
    echo "   - JWT_SECRET"
else
    echo "✓ .env ya existe"
fi

# Paso 4: Instalar dependencias server
echo ""
echo "4️⃣  Instalando dependencias del Backend..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error en instalación del backend"
    exit 1
fi
echo "✓ Backend instalado"
cd ..

# Paso 5: Instalar dependencias client
echo ""
echo "5️⃣  Instalando dependencias del Frontend..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error en instalación del frontend"
    exit 1
fi
echo "✓ Frontend instalado"
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Instalación completada!"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. EDITA .env con tus credenciales:"
echo "   - MONGODB_URI (de MongoDB Atlas)"
echo "   - STRIPE keys (de Stripe)"
echo "   - CLOUDINARY keys (de Cloudinary)"
echo "   - JWT_SECRET (genera con: openssl rand -base64 32)"
echo ""
echo "2. INICIA los servicios:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm start"
echo ""
echo "3. ACCEDE: http://localhost:3000"
echo ""
echo "Para más info: ver INSTALLATION.md o DEPLOYMENT.md"
echo "═══════════════════════════════════════════════════════════════"
