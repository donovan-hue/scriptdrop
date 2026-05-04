@echo off
REM Script para instalar nuevas dependencias de Fase 1 (Windows)

echo.
echo ================================================
echo   FASE 1: Glassmorphism ^& Gestos
echo   Instalando dependencias...
echo ================================================
echo.

cd client

echo Instalando paquetes NPM...
npm install react-gesture-handler@2.4.0 @react-spring/web@9.7.3 framer-motion@10.16.4

echo.
echo ================================================
echo   INSTALACION COMPLETADA!
echo ================================================
echo.
echo Nuevos paquetes:
echo   * react-gesture-handler    (Gestos)
echo   * @react-spring/web        (Animaciones)
echo   * framer-motion            (Motion)
echo.
echo Nuevos archivos:
echo   * client\src\styles\glassmorphism.css
echo   * client\src\hooks\useGestures.js
echo   * client\src\hooks\useTheme.js
echo   * client\src\components\UI\GlassComponents.jsx
echo   * client\src\components\UI\AnimatedComponents.jsx
echo.
echo Documentacion:
echo   * PHASE_1_IMPLEMENTATION.md
echo   * DEVELOPMENT_ROADMAP.md
echo.
pause
