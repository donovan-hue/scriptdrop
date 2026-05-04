@echo off
REM ============================================================
REM PASO 1: Instalar Capacitor y agregar plataforma Android
REM ============================================================
REM Requisitos previos:
REM   - Node.js 22 LTS instalado (recomendado, no 25)
REM   - JDK 17 instalado y JAVA_HOME configurado
REM   - Android SDK con cmdline-tools instalado
REM
REM Ejecutar desde: e:\kronos-super-app\client\
REM ============================================================

setlocal
cd /d "%~dp0\.."

echo.
echo === Verificando entorno ===
where node >nul 2>nul || (echo ERROR: Node.js no encontrado en PATH & exit /b 1)
where npm >nul 2>nul || (echo ERROR: npm no encontrado en PATH & exit /b 1)
where java >nul 2>nul || (echo ERROR: Java no encontrado. Instala JDK 17 y configura JAVA_HOME & exit /b 1)
if "%ANDROID_HOME%"=="" (
  echo ERROR: ANDROID_HOME no esta configurado.
  echo Configurar a: %%LOCALAPPDATA%%\Android\Sdk
  exit /b 1
)

echo.
echo === Instalando dependencias ===
call npm install --no-audit --no-fund || exit /b 1

echo.
echo === Auditoria de seguridad (solo fixes seguros) ===
call npm audit fix --no-audit --no-fund

echo.
echo === Instalando Capacitor ===
call npm install --save @capacitor/core @capacitor/android @capacitor/splash-screen @capacitor/status-bar @capacitor/app @capacitor/preferences @capacitor/network || exit /b 1
call npm install --save-dev @capacitor/cli @capacitor/assets || exit /b 1

echo.
echo === Build de produccion ===
set CI=false
call npm run build || exit /b 1

echo.
echo === Inicializando Capacitor ===
call npx cap init "Kronos Super-App" "com.kronos.superapp" --web-dir=build

echo.
echo === Agregando plataforma Android ===
call npx cap add android || exit /b 1

echo.
echo === Sincronizando ===
call npx cap sync android

echo.
echo ============================================================
echo  PASO 1 COMPLETADO
echo ============================================================
echo  Siguiente: Coloca tu icon.png (1024x1024) y splash.png
echo  (2732x2732) en android-resources\, luego ejecuta:
echo    scripts\2-generate-assets.bat
echo ============================================================
endlocal
