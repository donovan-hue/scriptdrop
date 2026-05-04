# 🚀 DEPLOYMENT GUIDE - Super-App MERN

Guía completa para desplegar el frontend en Vercel y el backend en Render.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

✅ Cuenta en [Vercel](https://vercel.com) (Frontend)
✅ Cuenta en [Render](https://render.com) (Backend)  
✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)
✅ Cuenta en [Stripe](https://stripe.com) (Pagos)
✅ Cuenta en [Cloudinary](https://cloudinary.com) (Multimedia)
✅ Git instalado en tu computadora
✅ Repositorio en GitHub (público o privado)

---

## 🌐 PARTE 1: Configurar Base de Datos (MongoDB Atlas)

### Paso 1: Crear Cluster

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click en **"Create"** → **Cluster**
3. Selecciona **Shared** (plan gratuito)
4. Elige región cercana a ti
5. Click **"Create Cluster"** (espera ~3-5 minutos)

### Paso 2: Crear Usuario de Base de Datos

1. En el cluster, ve a **Database Access**
2. Click **"Add Database User"**
3. Generador de contraseña automático o ingresa una fuerte
4. Click **"Add User"**
5. **Guarda las credenciales**: `username:password`

### Paso 3: Permitir Acceso desde Cualquier Lugar

1. Ve a **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Paso 4: Obtener Connection String

1. En el cluster, click **"Connect"**
2. Selecciona **"Drivers"**
3. Elige **Node.js** versión 4.2 o más reciente
4. Copia el connection string
5. Reemplaza `<password>` con la contraseña del usuario
6. El formato final es:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/super-app?retryWrites=true&w=majority
```

---

## 💳 PARTE 2: Configurar Stripe

### Paso 1: Obtener Claves API

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. En **Developers** → **API Keys**
3. Copia:
   - **Publishable Key** (comienza con `pk_`)
   - **Secret Key** (comienza con `sk_`)

### Paso 2: Configurar Webhook

Para pruebas locales:
```bash
# Instala Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# o descárgalo de https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward events localmente
stripe listen --forward-to localhost:5000/api/checkout/webhook
```

Para producción (en Render):
1. En Stripe Dashboard → **Webhooks**
2. Click **"Add Endpoint"**
3. URL: `https://your-backend.onrender.com/api/checkout/webhook`
4. Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copia el **Signing Secret** (comienza con `whsec_`)

### Paso 3: Test Mode

- Usa tarjeta de prueba: **4242 4242 4242 4242**
- Expiración: cualquier fecha futura (ej: 12/25)
- CVC: cualquier número de 3 dígitos

---

## 📸 PARTE 3: Configurar Cloudinary

### Paso 1: Obtener Credenciales

1. Ve a [Cloudinary Console](https://cloudinary.com/console)
2. Copia:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Paso 2: Configurar Carpetas (Opcional)

En Cloudinary Dashboard:
1. Ve a **Settings** → **Upload**
2. Configura carpetas para organizar:
   - `super-app/profiles/` - Avatares
   - `super-app/posts/` - Contenido de posts
   - `super-app/products/` - Imágenes de ropa
   - `super-app/food/` - Fotos de comida

---

## 🔧 PARTE 4: Preparar Repositorio GitHub

### Paso 1: Crear Repositorio

```bash
# En tu máquina local
cd super-app
git init
git add .
git commit -m "Initial commit: Super-App MERN"

# En GitHub, crea nuevo repositorio "super-app"
git remote add origin https://github.com/YOUR_USERNAME/super-app.git
git branch -M main
git push -u origin main
```

### Paso 2: Crear .gitignore

El `.gitignore` ya debe estar, pero verifica que incluya:
```
# En /super-app/.gitignore
node_modules/
.env
.env.local
.env.*.local
.DS_Store
```

### Paso 3: Verificar Archivos Importantes

```bash
# Debe existir .env.example (sin secrets reales)
# Debe existir server/package.json
# Debe existir client/package.json
# Debe existir la raíz package.json
```

---

## 🌍 PARTE 5: Desplegar Backend en Render

### Paso 1: Crear Servicio en Render

1. Ve a [Render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Conecta tu repositorio GitHub
4. Selecciona `super-app` repository
5. Configura:
   - **Name**: `super-app-backend` (o similar)
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` o `npm start`
   - **Plan**: Free (o Starter pagado para producción)

### Paso 2: Agregar Variables de Entorno

En **Environment**:
```
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/super-app
JWT_SECRET=your-super-secret-key-from-openssl-rand-base64-32
STRIPE_PUBLIC_KEY=pk_live_xxxxx (o pk_test_xxxxx para pruebas)
STRIPE_SECRET_KEY=sk_live_xxxxx (o sk_test_xxxxx para pruebas)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://super-app.vercel.app (actualizarémos después)
NODE_ENV=production
PORT=5000
```

### Paso 3: Deploy

1. Click **"Create Web Service"**
2. Render iniciará automáticamente el deploy
3. Espera 3-5 minutos
4. Cuando esté listo, verás URL: `https://super-app-backend.onrender.com`
5. Prueba: `https://super-app-backend.onrender.com/api/health`

### Paso 4: Actualizar Webhook en Stripe

Vuelve a Stripe Dashboard:
1. **Webhooks** → Edita el endpoint
2. URL: `https://super-app-backend.onrender.com/api/checkout/webhook`
3. Copia el nuevo **Signing Secret** si cambió
4. Actualiza `STRIPE_WEBHOOK_SECRET` en Render

---

## 🎨 PARTE 6: Desplegar Frontend en Vercel

### Paso 1: Crear Proyecto en Vercel

1. Ve a [Vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Conecta tu cuenta GitHub si no lo has hecho
4. Selecciona `super-app` repository
5. Click **"Import"**

### Paso 2: Configurar Proyecto

1. **Project Name**: `super-app` (o similar)
2. **Framework**: React
3. **Root Directory**: `client`
4. **Build Command**: `npm run build`
5. **Output Directory**: `build`
6. **Install Command**: `npm install`

### Paso 3: Agregar Variables de Entorno

En **Environment Variables**:
```
REACT_APP_API_URL=https://super-app-backend.onrender.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxxxx (o pk_test para pruebas)
```

### Paso 4: Deploy

1. Click **"Deploy"**
2. Vercel construirá y desplegará automáticamente
3. Espera ~2-3 minutos
4. Cuando esté listo: `https://super-app.vercel.app`

### Paso 5: Actualizar Variables en Render

Vuelve a Render y actualiza:
```
CLIENT_URL=https://super-app.vercel.app
```

---

## 🧪 PARTE 7: Pruebas Post-Despliegue

### Test 1: Backend Health Check
```bash
curl https://super-app-backend.onrender.com/api/health
# Debe responder: { "message": "✓ Server is running" }
```

### Test 2: CORS desde Frontend
1. Abre Frontend en navegador
2. Abre DevTools (F12)
3. Intenta registro o login
4. No debe haber errores de CORS

### Test 3: Pago de Prueba (Sin dinero real)
1. Ve a `/shop/checkout`
2. Usa tarjeta: `4242 4242 4242 4242`
3. Cualquier future date, cualquier CVC
4. Debe completarse sin errores

### Test 4: Multimedia Upload
1. Ve a crear post social
2. Intenta subir imagen/video
3. Debe guardarse en Cloudinary

---

## 🔒 Seguridad - Checklist Final

Antes de ir a Producción:

- [ ] `JWT_SECRET` es una cadena larga y aleatoria (minimum 32 caracteres)
- [ ] No hay credenciales reales en GitHub (solo en .env.example)
- [ ] MongoDB acceso limitado (IP whitelist en producción)
- [ ] Stripe está en modo LIVE con claves reales
- [ ] HTTPS habilitado en ambos servicios (automático en Vercel/Render)
- [ ] CORS configurado solo para dominio frontend
- [ ] Webhook signature verificada en backend

---

## 📱 Acceso desde Móvil

1. **Como prueba rápida**:
   - Obtén tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac)
   - Accede a: `http://192.168.x.x:3000`

2. **Publicado en Vercel**:
   - Accede a: `https://super-app.vercel.app` desde cualquier dispositivo

3. **Para desarrollo local**:
   ```bash
   # En tu máquina
   npm start  # Frontend
   npm run dev  # Backend
   
   # En otro dispositivo en tu red WiFi
   http://192.168.x.x:3000
   ```

---

## 🐛 Troubleshooting

### "Cannot GET /api/health"
- Verifica que Render está corriendo
- Revisa logs en Render Dashboard
- Verifica `MONGODB_URI` es válido

### "CORS error"
- Actualiza `CLIENT_URL` en backend .env
- En Vercel, actualiza `REACT_APP_API_URL`

### "Stripe payment failed"
- Verifica `STRIPE_SECRET_KEY` en backend
- Verifica `STRIPE_PUBLIC_KEY` en frontend
- Comprueba webhook configuration

### "Cloudinary upload fails"
- Verifica credenciales de Cloudinary
- Asegúrate API Key y Secret son correctos
- Comprueba límites de cuota (plan)

### "Database connection timeout"
- En MongoDB Atlas, permite IP `0.0.0.0/0` para Render
- Verifica `MONGODB_URI` formato exacto
- Asegúrate database existe

---

## 📊 Monitoreo Post-Despliegue

### Render Logs
1. Dashboard de Render
2. Servicio → **"Logs"**
3. Ver errores y requests en tiempo real

### Vercel Deployments
1. Dashboard de Vercel
2. Proyecto → **"Deployments"**
3. Click en último deploy → **"Logs"**

### Stripe Dashboard
- **Transactions** → Ver pagos procesados
- **Webhooks** → Verificar events recibidos
- **Logs** → Debugging de issues

---

## 🔄 CI/CD Automático

Render y Vercel auto-despliegan cada vez que haces push a `main`:

```bash
# En tu máquina
git add .
git commit -m "Update feature"
git push origin main

# Automáticamente:
# 1. Vercel detecta cambios → rebuilds frontend
# 2. Render detecta cambios → rebuilds backend
# 3. En 5-10 minutos todo está live
```

---

## 🎉 ¡Felicitaciones!

Tu Super-App está en vivo y accesible desde cualquier dispositivo en el mundo.

**URLs Finales**:
- 🌍 Frontend: `https://super-app.vercel.app`
- 🔌 Backend: `https://super-app-backend.onrender.com`
- 💾 Database: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net`

**Próximos pasos**:
- [ ] Agregar dominio personalizado (ej: super-app.com)
- [ ] Cambiar Stripe a modo LIVE
- [ ] Implementar backup automático en MongoDB
- [ ] Configurar emails de notificación
- [ ] Analytics en Google Analytics / Mixpanel

---

**Última actualización**: March 25, 2026
**Version**: 1.0.0
