# Publicar Kronos Super-App en Google Play Store

Este documento es la guia completa paso a paso. Sigue el orden.

---

## RESUMEN

La app es un cliente React. Para Play Store la envolvemos con
**Capacitor** (no es ni Cordova ni Bubblewrap/TWA). Capacitor genera
un proyecto Android nativo que carga la app web en un WebView con
acceso a APIs nativas (push, camara, almacenamiento).

Bundle ID: `com.kronos.superapp`

---

## REQUISITOS QUE TIENES QUE INSTALAR TU

### 1. Node.js 22 LTS (recomendado, NO 25)
- Tu versión actual: Node 25. React-scripts 5 puede dar problemas.
- Instala Node 22 LTS desde: https://nodejs.org/
- Si quieres mantener varias versiones: https://github.com/coreybutler/nvm-windows

### 2. JDK 17 (NO 25)
- El JDK 25 que tienes en `E:\OpenJDK25U-...msi` NO es compatible
  con Android Gradle Plugin actual.
- Descarga JDK 17 (Temurin): https://adoptium.net/temurin/releases/?version=17
- Instala con el MSI. Marca la opcion "Set JAVA_HOME" durante la instalacion.
- Verifica abriendo CMD nuevo:
  ```
  java -version
  echo %JAVA_HOME%
  ```

### 3. Android Studio + SDK cmdline-tools
- Tu Android SDK existe en `%LOCALAPPDATA%\Android\Sdk` pero **falta cmdline-tools**.
- Instala Android Studio: https://developer.android.com/studio
- Al abrirlo: SDK Manager > SDK Tools > marca "Android SDK Command-line Tools (latest)" > Apply.
- Configura variables de entorno (Win + R > sysdm.cpl > Avanzado > Variables):
  - `ANDROID_HOME` = `C:\Users\DONO\AppData\Local\Android\Sdk`
  - Anade al `Path`: `%ANDROID_HOME%\platform-tools` y `%ANDROID_HOME%\cmdline-tools\latest\bin`
- Cierra y reabre todas las terminales.

### 4. Cuenta de Google Play Console
- Registrate en: https://play.google.com/console/signup
- Costo: **$25 USD una sola vez**.
- Requiere: identidad verificada (DNI/pasaporte) + 48h aprox para activacion.
- Cuenta de desarrollador puede ser personal o de empresa.

### 5. Politica de Privacidad publicada
- Edita `PRIVACY_POLICY_TEMPLATE.md` con tus datos reales.
- Publicala en una URL publica con HTTPS:
  - Opcion gratis: GitHub Pages
  - Opcion gratis: tu propio dominio + Netlify/Vercel
- Necesitas la URL para Play Console.

---

## ASSETS QUE TIENES QUE PROVEER

Coloca estos archivos en `android-resources\`:

| Archivo                   | Tamaño         | Para que sirve                |
|---------------------------|----------------|-------------------------------|
| `icon.png`                | 1024x1024      | Icono de la app               |
| `splash.png`              | 2732x2732      | Pantalla de inicio            |
| `icon-foreground.png`     | 1024x1024      | (opcional) Icono adaptativo   |
| `icon-background.png`     | 1024x1024      | (opcional) Fondo adaptativo   |

El script `scripts\2-generate-assets.bat` genera automaticamente
todas las resoluciones requeridas (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi).

**Para Play Console** ademas necesitas:
- Icono 512x512 PNG
- Imagen feature 1024x500 PNG
- Minimo 2 capturas de pantalla del telefono (tomalas en el emulador)

---

## EJECUCION PASO A PASO

Todos los scripts estan en `scripts\`. Ejecutalos en orden desde
`e:\kronos-super-app\client\`.

### Paso 1: Instalar Capacitor + build inicial
```cmd
scripts\1-setup-android.bat
```
Instala dependencias, audita seguridad, hace build, instala
Capacitor y agrega plataforma Android.

### Paso 2: Generar iconos y splash
```cmd
scripts\2-generate-assets.bat
```
Necesita los archivos en `android-resources\`.

### Paso 3: Generar keystore (UNA SOLA VEZ)
```cmd
scripts\3-generate-keystore.bat
```
**CRITICO:** Si pierdes el keystore, NUNCA podras volver a publicar
actualizaciones de la app. Hazle backup en:
- Gestor de contrasenas (1Password/Bitwarden)
- USB cifrado offline
- NO en Google Drive sin cifrar

### Paso 4: Construir AAB firmado
```cmd
scripts\4-build-aab.bat
```
Genera: `android\app\build\outputs\bundle\release\app-release.aab`

Sube ese archivo a Play Console.

---

## CONFIGURACION EN PLAY CONSOLE

1. Crea una **App** nueva. Nombre: "Kronos Super-App". Categoria: Social.
2. Llena la **ficha de la tienda** (descripcion corta + larga + screenshots + icono).
3. **Cuestionario de contenido** (clasificacion por edad).
4. **Politica de privacidad**: pega la URL publica.
5. **Acceso a la app**: si requiere login, da credenciales de prueba.
6. **Publico objetivo**: edades.
7. **Anuncios**: no/si.
8. **Anadir version** > Pista interna (testing) > sube el `.aab`.
9. Espera revision (24-72h tipicamente).

---

## ASPECTOS DELICADOS DE TU APP - LEE ESTO

### Stripe
Google Play exige que los **bienes digitales** (suscripciones,
moneda virtual, etc.) usen **Google Play Billing**, no Stripe.
Stripe esta permitido SOLO para bienes/servicios fisicos
(delivery, productos, eventos).

Si vas a vender bienes digitales: tienes que integrar
`@capacitor-community/in-app-purchases` o similar y usar Play Billing.

### Web3 / Cripto (ethers)
Play tiene politicas estrictas: https://support.google.com/googleplay/android-developer/answer/9888379
- Permitido: gestion de wallet propia, NFT, navegacion de dApps.
- Prohibido: mineria en dispositivo, casinos cripto sin licencia.
- Requiere disclosure especifico en la ficha.

### Permisos
Capacitor genera un `AndroidManifest.xml` con permisos por defecto.
Revisalo en `android\app\src\main\AndroidManifest.xml` despues
del paso 1 y QUITA cualquier permiso que no uses (cada permiso
extra retrasa la revision).

### Backend
La app llama a un servidor (`server\` en este repo). Tienes que
deployarlo en HTTPS publico ANTES de subir a Play. Los URLs del
backend estan en `src\services\api.js` - revisa que apunten a la
URL de produccion, no a `localhost`.

---

## TROUBLESHOOTING

**`gradlew bundleRelease` falla con "Java version"**
- Tienes JDK 25, necesitas JDK 17. Reinstala.

**`npx cap sync` falla con "Cannot find module"**
- `npm install` quedo incompleto. Borra `node_modules` y `package-lock.json`, reinstala.

**Build de React falla con "fs-extra"**
- Mismo problema. `rm -rf node_modules package-lock.json && npm install`.

**Vulnerabilidades altas en `npm audit`**
- Mayoria son en dev-dependencies (webpack-dev-server, workbox)
  que NO se empaquetan en el AAB. Es seguro para release.
- `npm audit fix` para los que se pueden arreglar sin breaking changes.
- NO uses `npm audit fix --force` sin revisar - rompe react-scripts.

**Play Console rechaza el AAB**
- Lee la razon exacta. Suele ser:
  - Falta privacy policy o no es accesible.
  - Permisos sin justificar.
  - Targeting de Android API muy bajo.
  - Politicas de cripto/finanzas/Stripe.

---

## ARCHIVOS QUE DEJE LISTOS

```
e:\kronos-super-app\client\
├── capacitor.config.ts          (configuracion Capacitor)
├── public\manifest.json         (PWA manifest actualizado)
├── .gitignore                   (excluye keystores y secretos)
├── PLAY_STORE_README.md         (este archivo)
├── PRIVACY_POLICY_TEMPLATE.md   (plantilla de privacidad)
├── scripts\
│   ├── 1-setup-android.bat
│   ├── 2-generate-assets.bat
│   ├── 3-generate-keystore.bat
│   └── 4-build-aab.bat
└── android-resources\           (vacia - pon aqui tus iconos)
```

---

## CHECKLIST FINAL ANTES DE SUBIR

- [ ] Node 22 LTS instalado
- [ ] JDK 17 instalado, JAVA_HOME configurado
- [ ] Android SDK cmdline-tools instalado, ANDROID_HOME configurado
- [ ] Cuenta Play Console activa ($25 pagados)
- [ ] Privacy policy editada y publicada en URL HTTPS
- [ ] icon.png 1024x1024 y splash.png 2732x2732 en android-resources\
- [ ] Backend deployado en HTTPS publico
- [ ] URLs del backend actualizadas en src\services\api.js
- [ ] Capturas de pantalla tomadas (minimo 2)
- [ ] Icono Play Store 512x512 y feature image 1024x500 listos
- [ ] Keystore generado Y RESPALDADO en lugar seguro
- [ ] `scripts\4-build-aab.bat` corrio sin errores
- [ ] AAB probado en Pista Interna antes de produccion
