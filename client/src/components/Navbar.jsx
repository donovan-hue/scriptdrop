import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import TierBadge from './TierBadge';
import useSubscription from '../hooks/useSubscription';

const NAV_LINKS = [
  { to: '/feed',         label: 'Inicio',       icon: '🏠' },
  { to: '/search',       label: 'Buscar',        icon: '🔍' },
  { to: '/social/chat',  label: 'Chat',          icon: '💬' },
  { to: '/communities',  label: 'Comunidades',   icon: '🏛️' },
  { to: '/shop',         label: 'Tienda',         icon: '🛒' },
  { to: '/marketplace',  label: 'Marketplace',   icon: '🛍️' },
  { to: '/wallet',       label: 'Wallet',        icon: '💳' },
  { to: '/live',         label: 'Live',          icon: '🔴' },
  { to: '/health',       label: 'Health',        icon: '❤️' },
  { to: '/avatar',       label: 'Avatar',        icon: '🎭' },
  { to: '/reservations', label: 'Reservaciones', icon: '📅' },
  { to: '/video-editor', label: 'Video Editor',  icon: '🎬' },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const userId = user?._id || user?.id;

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.97)',
        borderBottom: '1.5px solid rgba(79,172,254,0.12)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 2px 16px rgba(79,172,254,0.08)',
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>

          {/* Logo */}
          <Link to="/feed" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>⭐</span>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: -0.5, background: 'linear-gradient(135deg,#a855f7,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kronos
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ flex: 1, display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none' }}
            className="hide-scrollbar desktop-nav">
            {NAV_LINKS.map(link => {
              const active = pathname === link.to || (link.to !== '/feed' && pathname.startsWith(link.to));
              return (
                <Link key={link.to} to={link.to}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, textDecoration: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', color: active ? '#0a0a14' : 'rgba(10,10,20,0.5)', background: active ? 'linear-gradient(135deg,rgba(79,172,254,0.15),rgba(243,160,255,0.12))' : 'transparent', border: active ? '1px solid rgba(79,172,254,0.25)' : '1px solid transparent', transition: 'all 0.15s', flexShrink: 0 }}>
                  <span style={{ fontSize: 14 }}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {user?.role === 'admin' && (
              <Link to="/admin"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, textDecoration: 'none', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: '#c4b5fd', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', flexShrink: 0 }}>
                🛡️ Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {user && (
              <>
                <NotificationCenter />

                <Link to={userId ? `/profile/${userId}` : '/auth/login'}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '4px 8px', borderRadius: 20, background: 'rgba(79,172,254,0.07)', border: '1px solid rgba(79,172,254,0.15)' }}>
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=32`}
                    alt={user.username}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ color: '#0a0a14', fontSize: 12, fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    className="hidden-mobile">
                    {user.username}
                  </span>
                  {tier && tier !== 'free' && <TierBadge tier={tier} />}
                </Link>

                <Link to="/settings"
                  style={{ color: 'rgba(10,10,20,0.5)', fontSize: 18, textDecoration: 'none', padding: 4 }}
                  title="Configuración">
                  ⚙️
                </Link>

                <button onClick={handleLogout}
                  style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  className="hidden-mobile">
                  Salir
                </button>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="hamburger-btn"
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div style={{ background: 'rgba(10,10,18,0.99)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
              {NAV_LINKS.map(link => {
                const active = pathname === link.to || (link.to !== '/feed' && pathname.startsWith(link.to));
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 12, textDecoration: 'none', color: active ? '#fff' : 'rgba(255,255,255,0.5)', background: active ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)', fontSize: 10, fontWeight: 600 }}>
                    <span style={{ fontSize: 20 }}>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/settings" onClick={() => setMenuOpen(false)}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                ⚙️ Configuración
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                🚪 Salir
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hidden-mobile { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
