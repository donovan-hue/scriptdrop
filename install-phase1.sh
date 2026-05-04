#!/bin/bash
# Script para instalar nuevas dependencias de Fase 1

echo "🎨 Instalando dependencias de FASE 1: Glassmorphism & Gestos"
echo "=========================================================="

cd client

echo ""
echo "📦 Instalando paquetes..."

npm install \
  react-gesture-handler@2.4.0 \
  @react-spring/web@9.7.3 \
  framer-motion@10.16.4

echo ""
echo "✅ Dependencias instaladas!"
echo ""
echo "Nuevos paquetes agregados:"
echo "  • react-gesture-handler: Manejo de gestos"
echo "  • @react-spring/web: Animaciones avanzadas"
echo "  • framer-motion: Ya existe, actualizado si es necesario"
echo ""
echo "📁 Nuevos archivos creados:"
echo "  • client/src/styles/glassmorphism.css"
echo "  • client/src/hooks/useGestures.js"
echo "  • client/src/hooks/useTheme.js"
echo "  • client/src/components/UI/GlassComponents.jsx"
echo "  • client/src/components/UI/AnimatedComponents.jsx"
echo ""
echo "🎨 FASE 1 lista para usar!"
