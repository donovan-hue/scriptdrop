# 🚀 QUICK START - Super-App

## 📦 Instalación Rápida (5 minutos)

### 1. Instalar Dependencias

```bash
# Backend
cd e:\super-app\server
npm install

# Frontend
cd e:\super-app\client
npm install
```

### 2. Configurar Variables de Entorno

**Backend** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/super-app
JWT_SECRET=tu_secreto_super_seguro_aqui
CLIENT_URL=http://localhost:3000

# Cloudinary (para multimedia)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (para pagos)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Frontend** (`client/.env.local`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Iniciar MongoDB

**Opción A: Local**
```bash
# Windows
mongod

# Mac/Linux
brew services start mongodb-community
```

**Opción B: MongoDB Atlas (Cloud)**
- Usa `mongodb+srv://user:pass@cluster.mongodb.net/super-app` en MONGODB_URI

### 4. Iniciar el Backend

```bash
cd server
npm run dev
```

Deberías ver:
```
╔════════════════════════════════════════╗
║  🚀 Super-App Server Running          ║
║  Port: 5000                           ║
║  URL: http://localhost:5000           ║
╚════════════════════════════════════════╝
```

### 5. Iniciar el Frontend

**En otra terminal:**
```bash
cd client
npm start
```

Se abrirá: `http://localhost:3000`

---

## 🧪 Probar la Aplicación

### 1. Registrarse
1. Go to `http://localhost:3000/register`
2. Llena el formulario
3. Haz clic en Register

### 2. Login
1. Usa el email y contraseña que registraste
2. Serás redirigido al Home (`/feed`)

### 3. Explorar Características

#### 🏠 Home - Feed Híbrido
- URL: `http://localhost:3000/feed`
- Mezcla de posts sociales + productos recomendados
- Interactúa con posts (like, comentar)

#### 📱 Social Module
- URL: `http://localhost:3000/social`
- Crea posts normales
- Sígueme a otros usuarios
- Chatea en tiempo real

#### 📸 Multimedia Posts
- En `/social`, haz clic en "Photo/Video/Music"
- Sube imagen, video o música
- Establece privacidad (Public/Followers/Private)
- ¡Publicar!

#### 🔍 Búsqueda Universal
- Haz clic en "Buscar" en la navbar
- Escribe para ver sugerencias
- Filtra por: Todo, Usuarios, Posts, Ropa
- Click en resultado para ir

#### 👤 Perfil de Usuario
- Haz clic en tu username/avatar en navbar
- Ve tus estadísticas
- Tabs: Posts, Órdenes, Followers

#### 🛍️ Shop (Ropa)
- URL: `http://localhost:3000/shop`
- Explora catálogo de ropa
- Usa filtros por categoría/precio
- Agrega al carrito
- Procede a checkout

#### 💳 Pagar con Stripe
- Ve a `/shop/checkout`
- Usa tarjeta de prueba: **4242 4242 4242 4242**
- Expiry: Cualquier fecha futura (ej: 12/25)
- CVC: Cualquier 3 dígitos (ej: 123)
- Click "Pay Now"

#### 🍕 Food Delivery
- URL: `http://localhost:3000/food`
- Selecciona restaurante
- Elige platillos
- Ingresa dirección
- Rastrear orden en tiempo real

---

## 🔌 Integración de Servicios

### Cloudinary (Multimedia)
1. Ve a https://cloudinary.com
2. Crea cuenta gratuita
3. Obtén: Cloud Name, API Key, API Secret
4. Pégalos en `server/.env`
5. ¡Listo para subir multimedia!

### Stripe (Pagos)
1. Ve a https://stripe.com
2. Crea cuenta y entra a dashboard
3. Ve a "API Keys"
4. Obtén: Publishable Key, Secret Key
5. Usa modo TEST (es el default)
6. Pégalos en ambos `.env`

### MongoDB (Base de Datos)
**Usar localmente:**
- Instala: https://www.mongodb.com/try/download/community
- Corre: `mongod`

**Usar en cloud:**
- Ve a https://www.mongodb.com/cloud/atlas
- Crea cluster gratuito
- Obtén connection string
- Pégalo en `MONGODB_URI`

---

## 🐛 Troubleshooting

### "Cannot find module 'multer-storage-cloudinary'"
```bash
cd server
npm install multer-storage-cloudinary
```

### "MongoDB connection error"
- ¿Está MongoDB ejecutándose?
- ¿MONGODB_URI es correcto?
- Prueba: `mongosh` para verificar

### "Cloudinary error uploading image"
- Verifica CLOUDINARY_NAME, API_KEY, API_SECRET
- Cuota no alcanzada en cuenta gratuita

### "Stripe payment fails"
- Usa tarjeta 4242 4242 4242 4242 en TEST mode
- Expiry y CVC pueden ser cualquiero en modo test

### "Socket.io connection failed"
- ¿Socket.io está en `localhost:5000`?
- ¿Firewall bloquea puerto 5000?

---

## 📂 Estructura Rápida

```
super-app/
├── server/
│   ├── models/           ← Schemas MongoDB
│   ├── controllers/      ← Lógica de negocios
│   ├── routes/           ← Endpoints API
│   ├── middleware/       ← Auth, upload
│   ├── server.js         ← Punto de entrada
│   └── .env.example      ← Copiar a .env
└── client/
    ├── src/
    │   ├── social/       ← Módulo social
    │   ├── shop/         ← Módulo ropa
    │   ├── food/         ← Módulo delivery
    │   ├── components/   ← Globales + Buscar + Perfil
    │   └── App.jsx       ← Main routes
    └── .env.example      ← Copiar a .env.local
```

---

## 🎯 Checklist de Verificación

- [ ] Terminal 1: `npm run dev` en `/server` 
- [ ] Terminal 2: `npm start` en `/client`
- [ ] Puedes abrir http://localhost:3000
- [ ] Puedes registrarte
- [ ] Puedes hacer login
- [ ] Ves el feed híbrido
- [ ] Puedes buscar usuarios
- [ ] Puedes explorar productos
- [ ] Portfolio multimedia sube (si tiene Cloudinary)
- [ ] Stripe pagos funciona (si tiene credenciales)

---

## 💡 Tips Útiles

1. **Limpiar Cache**: `Ctrl+Shift+Del` en navegador
2. **Ver Console Errors**: `F12` en navegador
3. **Verificar BD**: 
   ```bash
   mongosh
   use super-app
   db.users.find()
   ```
4. **Resetear BD**: Borra todas las colecciones
5. **Logs del Server**: Ve la terminal donde corre `npm run dev`

---

## 📞 Soporte

Si algo no funciona:
1. Verifica que todos los `.env` están configurados
2. Verifica que MongoDB está corriendo
3. Verifica los logs en ambas terminales
4. Reinstala dependencias: `rm -rf node_modules && npm install`

---

**¡Aprieta y diviértete!** 🎉
