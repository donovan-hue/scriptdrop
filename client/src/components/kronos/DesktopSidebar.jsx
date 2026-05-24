import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Inicio',        to: '/feed' },
  { icon: '🔍', label: 'Buscar',        to: '/search' },
  { icon: '💬', label: 'Mensajes',      to: '/social/chat' },
  { icon: '🔔', label: 'Notificaciones',to: '/notifications' },
  { icon: '👥', label: 'Comunidades',   to: '/communities' },
  { icon: '🛍️', label: 'Marketplace',   to: '/marketplace' },
  { icon: '💳', label: 'Wallet',        to: '/wallet' },
  { icon: '🔴', label: 'LIVE',          to: '/live' },
  { icon: '❤️', label: 'Health',        to: '/health' },
  { icon: '🎭', label: 'Avatar',        to: '/avatar' },
  { icon: '📅', label: 'Reservaciones', to: '/reservations' },
  { icon: '🎬', label: 'Video Editor',  to: '/video-editor' },
  { icon: '⚙️', label: 'Ajustes',       to: '/settings' },
];

export default function DesktopSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const userId = user?._id || user?.id;

  return (
    <aside className="kronos-sidebar">
      {/* Logo */}
      <div
        onClick={() => navigate('/feed')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 16, cursor: 'pointer' }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff',
        }}>K</div>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>Kronos</span>
      </div>

      {/* Nav links */}
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
            background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
            fontWeight: isActive ? 700 : 400,
            fontSize: 14,
            transition: 'all 0.15s',
          })}
          onMouseEnter={e => { if (!e.currentTarget.style.background.includes('124,58,237,0.25')) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { if (!e.currentTarget.style.background.includes('124,58,237,0.25')) e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User profile */}
      {user && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 8 }}>
          <div
            onClick={() => navigate(userId ? `/profile/${userId}` : '/profile/me')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 8 }}
          >
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'K')}&background=7c3aed&color=fff&size=36`}
              alt=""
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.firstName || user.username}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>@{user.username}</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '8px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.8)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}
