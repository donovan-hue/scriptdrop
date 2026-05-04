import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function messageFor(notif) {
  switch (notif.type) {
    case 'like':     return '❤️ Alguien dio like a tu post';
    case 'comment':  return '💬 Nuevo comentario en tu post';
    case 'follower': return '👤 Alguien te empezo a seguir';
    case 'order':    return `📦 Orden #${notif.orderId || ''} ${notif.status || 'actualizada'}`;
    case 'tip':      return `💰 Recibiste una propina de $${notif.amount || 0}`;
    case 'message':  return `💬 Nuevo mensaje de ${notif.from || 'alguien'}`;
    default:         return notif.message || '🔔 Nueva notificacion';
  }
}

export default function NotificationToast() {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.emit('join', user._id || user.id);

    const handler = (notif = {}) => {
      const msg = messageFor(notif);
      const icon = notif.type === 'like' ? '❤️'
        : notif.type === 'comment' ? '💬'
        : notif.type === 'order' ? '📦'
        : notif.type === 'follower' ? '👤'
        : notif.type === 'tip' ? '💰'
        : '🔔';
      toast(msg, { icon, duration: 4000, position: 'top-right' });
    };

    ['notification', 'like', 'comment', 'follower', 'order', 'tip', 'message'].forEach((ev) => {
      socket.on(ev, (data) => handler({ ...data, type: data?.type || ev }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  return null;
}
