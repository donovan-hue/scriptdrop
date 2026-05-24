import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import IridescentDefs from './IridescentDefs';

// SVG Icons tornasol 3D
const IconHome = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="url(#iridescent-grad)" />
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="url(#gloss-grad)" opacity="0.4" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <circle cx="10.5" cy="10.5" r="7.5" fill="none" stroke="url(#iridescent-grad)" strokeWidth="3"/>
    <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="url(#iridescent-grad)" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const IconNotif = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconChat = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="url(#iridescent-grad)"/>
    <circle cx="6" cy="10" r="1.5" fill="#fff"/>
    <circle cx="12" cy="10" r="1.5" fill="#fff"/>
    <circle cx="18" cy="10" r="1.5" fill="#fff"/>
  </svg>
);

const IconProfile = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconHealth = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.5 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconWallet = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconMarket = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#iridescent-grad)" strokeWidth="3"/>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconLive = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <rect x="2" y="4" width="20" height="16" rx="4" fill="none" stroke="url(#iridescent-grad)" strokeWidth="2"/>
    <text x="12" y="14" fontFamily="Arial" fontWeight="bold" fontSize="6" fill="url(#iridescent-grad)" textAnchor="middle">LIVE</text>
  </svg>
);

const IconSettings = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconCommunities = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="url(#iridescent-grad)"/>
  </svg>
);

const IconAvatar = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" filter="url(#3d-glass)">
    <circle cx="12" cy="12" r="10" fill="url(#iridescent-grad)"/>
    <path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z" fill="#fff"/>
    <circle cx="8.5" cy="9.5" r="1.5" fill="#fff"/>
    <circle cx="15.5" cy="9.5" r="1.5" fill="#fff"/>
  </svg>
);

const NAV_ITEMS = [
  { Icon: IconHome,        label: 'Inicio',        to: '/feed' },
  { Icon: IconSearch,      label: 'Buscar',         to: '/search' },
  { Icon: IconChat,        label: 'Chat',           to: '/social/chat' },
  { Icon: IconNotif,       label: 'Alertas',        to: '/notifications' },
  { Icon: IconProfile,     label: 'Perfil',         to: '/profile/me' },
];

// Burbuja individual animada
function Bubble({ item, active, badge }) {
  const [pressed, setPressed] = useState(false);

  return (
    <NavLink
      to={item.to}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      <div style={{
        position: 'relative',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: active
          ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25), rgba(79,172,254,0.15) 50%, rgba(243,160,255,0.1))'
          : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
        border: active
          ? '1.5px solid rgba(79,172,254,0.6)'
          : '1.5px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: active
          ? '0 0 18px rgba(79,172,254,0.4), 0 0 35px rgba(243,160,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        transform: pressed ? 'scale(0.88)' : active ? 'scale(1.08)' : 'scale(1)',
        transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'pointer',
      }}>
        {/* Gloss highlight */}
        <div style={{
          position: 'absolute',
          top: 6,
          left: 10,
          width: 28,
          height: 14,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <item.Icon />
        {badge > 0 && (
          <div style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: 'linear-gradient(135deg,#ff85a2,#f3a0ff)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            width: 17,
            height: 17,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid rgba(10,10,18,0.9)',
            boxShadow: '0 0 8px rgba(243,160,255,0.6)',
          }}>
            {badge > 9 ? '9+' : badge}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 9,
        fontWeight: active ? 700 : 400,
        color: active ? '#a8d8ff' : 'rgba(255,255,255,0.4)',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: 0.3,
      }}>
        {item.label}
      </span>
    </NavLink>
  );
}

export default function BubbleNav({ items }) {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const [unread, setUnread] = useState(0);
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (pathname === '/notifications') setUnread(0);
  }, [pathname]);

  const resolvedItems = items || NAV_ITEMS.map(it => ({
    ...it,
    to: it.to === '/profile/me' && userId ? `/profile/${userId}` : it.to,
  }));

  return (
    <>
      <IridescentDefs />
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'rgba(8,8,15,0.85)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 12px 8px',
        zIndex: 200,
      }}
        className="kronos-bottom-nav"
      >
        {resolvedItems.map(item => {
          const active = pathname === item.to || (item.to !== '/feed' && pathname.startsWith(item.to));
          const badge = item.to === '/notifications' ? unread : 0;
          return <Bubble key={item.to} item={item} active={active} badge={badge} />;
        })}
      </nav>
    </>
  );
}
