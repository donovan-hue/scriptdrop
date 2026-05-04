import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

/**
 * Genera texto descriptivo segun el tipo de notificacion
 */
function getNotificationMessage(notif) {
  switch (notif.type) {
    case 'like':
      return 'alguien dio like a tu post';
    case 'comment':
      return 'alguien comentó en tu post';
    case 'order':
      return `tu orden #${notif.orderId || ''} fue ${notif.status === 'confirmed' ? 'confirmada' : 'actualizada'}`;
    case 'follower':
      return 'alguien te empezó a seguir';
    default:
      return notif.message || 'nueva notificación';
  }
}

/**
 * Retorna tiempo relativo (hace N min / hace N h / hace N d)
 */
function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  if (minutes > 0) return `hace ${minutes} min`;
  return 'ahora mismo';
}

/**
 * Icono segun tipo de notificacion
 */
function NotifIcon({ type }) {
  const icons = {
    like:     { emoji: '❤️',  bg: 'bg-red-500' },
    comment:  { emoji: '💬',  bg: 'bg-blue-500' },
    order:    { emoji: '📦',  bg: 'bg-green-500' },
    follower: { emoji: '👤',  bg: 'bg-purple-500' },
  };
  const { emoji, bg } = icons[type] || { emoji: '🔔', bg: 'bg-gray-500' };
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${bg}`}
      aria-hidden="true"
    >
      {emoji}
    </div>
  );
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Conectar Socket.io y escuchar notificaciones ───────────────────────────
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // Registrar al usuario en el servidor
    socket.emit('user_online', user.id || user._id);

    socket.on('notification', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          ...data,
          timestamp: data.timestamp || new Date(),
          read: false,
        },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // ── Cerrar al hacer click fuera ────────────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Campana ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none"
      >
        {/* Icono campana SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
               6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6
               8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6
               0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge contador */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white
                       text-[10px] font-bold rounded-full flex items-center justify-center px-1
                       shadow-lg animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 z-50 rounded-2xl overflow-hidden
                     shadow-2xl border border-white/30"
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
            <h3 className="font-bold text-white text-sm tracking-wide">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-200 hover:text-white transition-colors font-medium"
              >
                Marcar todas como leidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/10">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-white/60 text-sm select-none">
                <div className="text-3xl mb-2">🔔</div>
                Sin notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors
                    hover:bg-white/10 focus:outline-none
                    ${notif.read ? 'opacity-60' : 'opacity-100'}`}
                >
                  <NotifIcon type={notif.type} />

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs leading-snug truncate-2 line-clamp-2">
                      {getNotificationMessage(notif)}
                    </p>
                    <p className="text-white/50 text-[10px] mt-1">
                      {timeAgo(notif.timestamp)}
                    </p>
                  </div>

                  {/* Punto no leido */}
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-1 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/20 px-4 py-2 text-center">
              <button
                onClick={() => setNotifications([])}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Limpiar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
