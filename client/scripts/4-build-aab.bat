@echo off
REM ============================================================
REM PASO 4: Construir AAB firmado para Play Store
REM ============================================================

setlocal
cd /d "%~dp0\.."

if not exist "android\app\release.keystore" (
  echo ERROR: Falta keystore. Ejecuta primero: scripts\3-generate-keystore.bat
  exit /b 1
)
if not exist "android\gradle.properties.local" (
  echo ERROR: Falta gradle.properties.local. Ejecuta scripts\3-generate-keystore.bat
  exit /b 1
)

echo === Build de produccion del cliente ===
set CI=false
call npm run build || exit /b 1

echo.
echo === Sincronizando con Capacitor ===
call npx cap sync android || exit /b 1

echo.
echo === Compilando AAB de release ===
pushd android
call gradlew.bat -p . :app:bundleRelease ^
  -Pandroid.injected.signing.store.file=app\release.keystore ^
  --project-prop-file=gradle.properties.local
set BUILDRC=%errorlevel%
popd
if %BUILDRC% neq 0 (
  echo ERROR en gradle. Revisa el log arriba.
  exit /b %BUILDRC%
)

echo.
echo ============================================================
echo  AAB generado:
echo    android\app\build\outputs\bundle\release\app-release.aab
echo.
echo  Sube este archivo a:
echo    https://play.google.com/console
echo ============================================================
endlocal
