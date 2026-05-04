import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const DEFAULT_ITEMS = [
  { icon: '🏠', label: 'Inicio', to: '/feed' },
  { icon: '🛒', label: 'Tienda', to: '/shop' },
  { icon: '💬', label: 'Chat', to: '/social/chat' },
  { icon: '🍔', label: 'Food', to: '/food' },
  { icon: '👤', label: 'Perfil', to: '/profile/me' },
];

export default function BottomNav({ items = DEFAULT_ITEMS }) {
  const { pathname } = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'rgba(10,10,18,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 100,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {items.map((it) => {
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
            }}
          >
            <span style={{ fontSize: 20 }}>{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
