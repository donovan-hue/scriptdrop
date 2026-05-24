import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function BottomNav({ items }) {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const userId = user._id || user.id;

    // Carga inicial
    const fetchUnread = async () => {
      try {
        const { data } = await axios.get(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnread(data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();

    // Socket.io — tiempo real
    const sock = io(API, { transports: ['websocket', 'polling'] });
    sock.emit('user_online', userId);
    sock.on('notification', () => setUnread(n => n + 1));

    // Polling de respaldo cada 60s
    const interval = setInterval(fetchUnread, 60000);

    return () => { sock.close(); clearInterval(interval); };
  }, [user]);

  // Resetear badge al entrar a /notifications
  useEffect(() => {
    if (pathname === '/notifications') setUnread(0);
  }, [pathname]);

  const userId = user?._id || user?.id;

  const DEFAULT_ITEMS = [
    { icon: '🏠', label: 'Inicio',       to: '/feed' },
    { icon: '💳', label: 'Wallet',        to: '/wallet' },
    { icon: '💬', label: 'Chat',          to: '/social/chat' },
    { icon: '🔔', label: 'Alertas',       to: '/notifications', badge: unread },
    { icon: '👤', label: 'Perfil',        to: userId ? `/profile/${userId}` : '/profile/me' },
  ];

  const navItems = items || DEFAULT_ITEMS;

  return (
    <nav
      className="kronos-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'rgba(10,10,18,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 100,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {navItems.map((it) => {
        const active = pathname === it.to || pathname.startsWith(it.to + '/');
        return (
          <NavLink
            key={it.to}
            to={it.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: active ? '#a855f7' : 'rgba(255,255,255,0.4)',
              fontSize: 9,
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ fontSize: 20 }}>{it.icon}</span>
              {it.badge > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 800,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(10,10,18,0.95)',
                }}>
                  {it.badge > 9 ? '9+' : it.badge}
                </div>
              )}
            </div>
            <span>{it.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
