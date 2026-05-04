@echo off
REM ============================================================
REM PASO 2: Generar iconos y splash para Android
REM ============================================================
REM Requisitos:
REM   - android-resources\icon.png      (1024x1024 recomendado)
REM   - android-resources\splash.png    (2732x2732 recomendado)
REM   - android-resources\icon-foreground.png (opcional, adaptativo)
REM   - android-resources\icon-background.png (opcional, adaptativo)
REM ============================================================

setlocal
cd /d "%~dp0\.."

if not exist "android-resources\icon.png" (
  echo ERROR: Falta android-resources\icon.png ^(1024x1024^)
  exit /b 1
)
if not exist "android-resources\splash.png" (
  echo ERROR: Falta android-resources\splash.png ^(2732x2732^)
  exit /b 1
)

echo === Generando assets con @capacitor/assets ===
call npx capacitor-assets generate --android --assetPath android-resources || exit /b 1

echo.
echo === Sincronizando con Android ===
call npx cap sync android

echo.
echo ============================================================
echo  PASO 2 COMPLETADO
echo  Iconos y splash generados en android\app\src\main\res\
echo  Siguiente: scripts\3-generate-keystore.bat
echo ============================================================
endlocal
