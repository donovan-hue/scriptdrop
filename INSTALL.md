# KRONOS FIX PACK — Instrucciones de instalación

Este pack completa el 13% que faltaba: MongoDB, Admin Dashboard, Email, Push/PWA,
Toast UI, Video upload/player y limpieza de docs.

## 1. Copiar archivos al proyecto

Desde la raíz de `kronos/super-app`, copia preservando estructura:

```
server/config/db.js
server/middleware/requireAdmin.js
server/services/emailService.js
server/services/pushService.js
server/templates/emails/*.html
server/routes/admin.js              ← reemplaza el viejo
server/controllers/adminController.js   ← mergea con el viejo si tiene cosas

client/public/service-worker.js
client/public/manifest.json
client/src/registerSW.js
client/src/components/NotificationToast.jsx
client/src/components/videos/VideoPlayer.jsx
client/src/components/videos/VideoUploader.jsx
client/src/pages/Admin/Dashboard.jsx
client/src/pages/Admin/Users.jsx
client/src/pages/Admin/Content.jsx
client/src/pages/Admin/Stats.jsx
client/src/pages/Admin/Reports.jsx

.env.example  ← reemplaza el viejo
scripts/cleanup-docs.sh
```

## 2. Instalar dependencias

```bash
cd server
npm install nodemailer web-push

cd ../client
npm install react-hot-toast
```

## 3. Configurar .env

Copia `.env.example` a `.env` y completa:
- `MONGODB_URI` (real)
- `SMTP_*` (Gmail, SendGrid o Mailtrap para pruebas)
- `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`: genera con
  ```
  npx web-push generate-vapid-keys
  ```
- `REACT_APP_CLOUDINARY_*` para upload de video

## 4. Conectar en el código existente

### server/server.js (o app.js / index.js)
```js
const connectDB = require('./config/db');
connectDB();

app.use('/api/admin', require('./routes/admin'));
```

### server/controllers/authController.js (registro)
```js
const email = require('../services/emailService');
// después de crear el usuario:
email.sendWelcome(user.email, user.username);
```

### server/controllers/orderController.js
```js
const email = require('../services/emailService');
email.sendOrderConfirmation(user.email, user.username, order._id, order.total);
```

### server/models/User.js — añadir campo
```js
pushSubscription: { type: Object, default: null },
banned: { type: Boolean, default: false },
role: { type: String, default: 'user' },
```

### client/src/index.js
```js
import { registerSW } from './registerSW';
registerSW();
```

### client/src/App.jsx — añadir ruta y toaster
```js
import NotificationToast from './components/NotificationToast';
import AdminDashboard from './pages/Admin/Dashboard';
// dentro del router:
<Route path="/admin/*" element={<AdminDashboard />} />
// en algún punto alto del árbol:
<NotificationToast socket={socket} />
```

### client/src/components/MultiMediaPostCreator.jsx
```js
import VideoUploader from './videos/VideoUploader';
// en el JSX:
<VideoUploader onUploaded={(v) => setMedia([...media, v])} />
```

## 5. Limpiar docs

```bash
bash scripts/cleanup-docs.sh /ruta/a/super-app
```

## 6. Probar

```bash
cd server && npm start
cd client && npm start
```

Checklist:
- [ ] Backend arranca y conecta a MongoDB
- [ ] Registro envía email de bienvenida
- [ ] /admin abre el dashboard (necesitas user con role='admin')
- [ ] Service worker se registra (DevTools > Application)
- [ ] Toast aparece al recibir evento socket
- [ ] Video sube a Cloudinary y se reproduce

## 7. Crear el primer admin

En MongoDB:
```js
db.users.updateOne({ email: 'tuemail@x.com' }, { $set: { role: 'admin' } })
```
