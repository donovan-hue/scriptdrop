// Importa esto desde client/src/index.js: import { registerSW } from './registerSW';
// Y llámalo: registerSW();

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[SW] registrado');
    await subscribePush(reg);
  } catch (err) {
    console.error('[SW] error:', err);
  }
}

async function subscribePush(reg) {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
    const res = await fetch('/api/admin/push/vapid-public-key');
    const { key } = await res.json();
    if (!key) return;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
    const token = localStorage.getItem('token');
    await fetch('/api/admin/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(sub),
    });
  } catch (err) { console.error('[Push] subscribe error:', err); }
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
