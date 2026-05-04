# Donde pegar cada clave al deployar

Este archivo NO contiene secretos — es solo una guia de en que campo
del dashboard pegar cada valor que ya tienes.

---

## RENDER (Backend) — Environment tab

Despues de crear el servicio web, ve a tu servicio > **Environment**
> **Add Environment Variable** y crea estas:

| Key                       | Valor (de donde sale)                                  |
|---------------------------|--------------------------------------------------------|
| `MONGODB_URI`             | Connection string de MongoDB Atlas (paso 2)            |
| `JWT_SECRET`              | Genera una random: en CMD `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRE`              | `7d`                                                   |
| `CLIENT_URL`              | URL de Vercel (la sabras DESPUES del paso 7) — pon `https://placeholder.vercel.app` por ahora y la actualizas |
| `STRIPE_SECRET_KEY`       | Stripe Dashboard > Developers > API keys > Secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET`   | Stripe Dashboard > Developers > Webhooks > tu endpoint > Signing secret (`whsec_...`). Si no creaste webhook aun, dejalo vacio y lo configuras despues. |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary Dashboard > Account Details > Cloud Name    |
| `CLOUDINARY_API_KEY`      | Cloudinary Dashboard > Account Details > API Key       |
| `CLOUDINARY_API_SECRET`   | Cloudinary Dashboard > Account Details > API Secret    |

`NODE_ENV`, `PORT`, `LOG_LEVEL` ya estan en `render.yaml`, no las pongas a mano.

---

## VERCEL (Frontend) — Environment Variables

Despues de importar el repo, en **Settings > Environment Variables**:

| Key                            | Valor                                                  |
|--------------------------------|--------------------------------------------------------|
| `REACT_APP_API_URL`            | `https://[tu-servicio-render].onrender.com/api`        |
| `REACT_APP_SOCKET_URL`         | `https://[tu-servicio-render].onrender.com`            |
| `REACT_APP_STRIPE_PUBLIC_KEY`  | Stripe Dashboard > API keys > Publishable key (`pk_test_...`) |

Aplica a: **Production**, **Preview**, **Development** (marca los 3).

---

## DESPUES DEL PRIMER DEPLOY

1. Vercel te da una URL tipo `https://kronos-super-app-xxx.vercel.app`.
2. Copiala. Ve a Render > tu servicio > Environment > edita `CLIENT_URL`
   con esa URL. Click **Save Changes** (Render redeploya solo).

Sin esto, el backend va a rechazar las peticiones del frontend por CORS.

---

## CHECKLIST FINAL ANTES DE DEPLOY

- [ ] MongoDB Atlas: cluster M0 creado, usuario `kronos` con password,
      Network Access en `0.0.0.0/0`.
- [ ] Cloudinary: cuenta creada, 3 valores copiados.
- [ ] Stripe: cuenta creada (modo test OK), `pk_test_` y `sk_test_` copiados.
- [ ] GitHub: repo `kronos-super-app` creado en privado.
- [ ] `JWT_SECRET` generado random (no uses uno de ejemplo).
