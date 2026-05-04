@echo off
REM ============================================================
REM PASO 3: Generar keystore de release (UNA SOLA VEZ)
REM ============================================================
REM IMPORTANTE: GUARDA EL KEYSTORE Y LA CONTRASENA EN UN LUGAR
REM SEGURO. SI LO PIERDES, NO PODRAS ACTUALIZAR LA APP NUNCA MAS.
REM
REM Recomendacion: subirlo a un gestor de contrasenas + backup
REM offline cifrado.
REM ============================================================

setlocal
cd /d "%~dp0\.."

if exist "android\app\release.keystore" (
  echo ATENCION: Ya existe android\app\release.keystore
  echo Si continuas se SOBREESCRIBIRA y perderas acceso a la app
  echo publicada con ese keystore.
  set /p CONFIRM="Escribe SI para continuar: "
  if /i not "%CONFIRM%"=="SI" exit /b 1
)

where keytool >nul 2>nul || (echo ERROR: keytool no encontrado. Instala JDK 17. & exit /b 1)

echo.
echo === Generando keystore ===
echo Te pedira:
echo   - Contrasena del keystore ^(minimo 6 chars^)
echo   - Tu nombre, organizacion, ciudad, pais
echo.

keytool -genkey -v ^
  -keystore android\app\release.keystore ^
  -alias kronos-release ^
  -keyalg RSA -keysize 4096 -validity 10000

if errorlevel 1 (
  echo ERROR generando keystore
  exit /b 1
)

echo.
echo === Configurando gradle.properties ===
set /p KSPASS="Reingresa la contrasena del keystore: "

(
echo MYAPP_RELEASE_STORE_FILE=release.keystore
echo MYAPP_RELEASE_KEY_ALIAS=kronos-release
echo MYAPP_RELEASE_STORE_PASSWORD=%KSPASS%
echo MYAPP_RELEASE_KEY_PASSWORD=%KSPASS%
) > android\gradle.properties.local

echo.
echo ============================================================
echo  Keystore generado en: android\app\release.keystore
echo  Credenciales en:      android\gradle.properties.local
echo.
echo  AMBOS estan en .gitignore - NUNCA los subas a git.
echo  HAZ UN BACKUP del keystore AHORA mismo.
echo.
echo  Siguiente: scripts\4-build-aab.bat
echo ============================================================
endlocal
