import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const BUBBLES = [
  {
    id: 'inicio',
    emoji: '🏠',
    corner: { bottom: 90, left: 16 },
    fanDirection: 'up-right',
    subs: [
      { emoji: '📝', label: 'Post',     path: '/feed' },
      { emoji: '📸', label: 'Foto',     path: '/feed?type=photo' },
      { emoji: '🎥', label: 'Video',    path: '/video-editor' },
      { emoji: '📖', label: 'Historia', path: '/social/stories' },
      { emoji: '🔴', label: 'LIVE',     path: '/live' },
    ],
  },
  {
    id: 'buscar',
    emoji: '🔍',
    corner: { bottom: 90, right: 16 },
    fanDirection: 'up-left',
    subs: [
      { emoji: '👤', label: 'Personas',    path: '/search?type=people' },
      { emoji: '🏪', label: 'Tiendas',     path: '/search?type=shops' },
      { emoji: '🏘️', label: 'Comunidades', path: '/communities' },
    ],
  },
  {
    id: 'chat',
    emoji: '💬',
    corner: { bottom: 16, left: 16 },
    fanDirection: 'up-right',
    subs: [
      { emoji: '💬', label: 'Chat',           path: '/social/chat' },
      { emoji: '👥', label: 'Grupos',         path: '/social/groups' },
      { emoji: '🔔', label: 'Notificaciones', path: '/notifications' },
    ],
  },
  {
    id: 'perfil',
    emoji: '👤',
    corner: { bottom: 16, right: 16 },
    fanDirection: 'up-left',
    subs: [
      { emoji: '👁️', label: 'Mi perfil',    path: '/profile/me' },
      { emoji: '🏆', label: 'Gamificación', path: '/gamification' },
      { emoji: '💰', label: 'Wallet',       path: '/wallet' },
      { emoji: '🎪', label: 'Eventos',      path: '/events' },
      { emoji: '⚙️', label: 'Ajustes',      path: '/settings' },
    ],
  },
];

function getFanPositions(direction, count) {
  const radius = 88;
  // up-right: abanico hacia arriba y hacia la derecha (centro pantalla)
  // up-left:  abanico hacia arriba y hacia la izquierda (centro pantalla)
  const startAngle = direction === 'up-right' ? -160 : -20;
  const range      = direction === 'up-right' ?   80 : -80;
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = ((startAngle + range * t) * Math.PI) / 180;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

// Esfera de vidrio 3D realista usando múltiples capas CSS
function GlassSphere({ size, emoji, isOpen, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        transform: isOpen ? 'scale(1.18)' : 'scale(1)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        ...style,
      }}
    >
      {/* Capa base — cristal transparente tornasol */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: isOpen
          ? 'radial-gradient(circle at 38% 38%, rgba(255,255,255,0.35) 0%, rgba(139,92,246,0.18) 40%, rgba(6,182,212,0.12) 70%, rgba(255,255,255,0.05) 100%)'
          : 'radial-gradient(circle at 38% 38%, rgba(255,255,255,0.28) 0%, rgba(139,92,246,0.12) 40%, rgba(6,182,212,0.08) 70%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isOpen
          ? '0 8px 32px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.1), inset 0 -2px 8px rgba(139,92,246,0.15)'
          : '0 4px 20px rgba(109,40,217,0.2), 0 2px 6px rgba(0,0,0,0.08), inset 0 -2px 6px rgba(6,182,212,0.1)',
      }} />

      {/* Sombra interna inferior suave */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 80%, rgba(139,92,246,0.12) 0%, transparent 60%)',
      }} />

      {/* Reflejo lateral tornasol */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 75% 50%, rgba(6,182,212,0.12) 0%, transparent 55%)',
      }} />

      {/* Brillo especular principal — punto de luz superior izquierdo */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '16%',
        width: '42%', height: '28%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        filter: 'blur(1.5px)',
        transform: 'rotate(-25deg)',
      }} />

      {/* Brillo secundario pequeño */}
      <div style={{
        position: 'absolute',
        top: '18%', left: '55%',
        width: '14%', height: '10%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.6)',
        filter: 'blur(1px)',
      }} />

      {/* Borde translúcido */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.25)',
        boxSizing: 'border-box',
      }} />

      {/* Emoji centrado */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38,
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
      }}>
        {emoji}
      </div>
    </div>
  );
}

const MAIN_SIZE = 54;
const SUB_SIZE  = 42;

export default function ExpandableBubbleNav() {
  const navigate  = useNavigate();
  const { user }  = useContext(AuthContext);
  const [openId, setOpenId] = useState(null);

  if (!user) return null;

  const toggle = (id) => setOpenId(prev => (prev === id ? null : id));
  const close  = () => setOpenId(null);

  return (
    <>
      <style>{`
        @keyframes bubbleFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-5px) scale(1.03); }
        }
        @keyframes subPopIn {
          0%   { opacity:0; transform: translate(var(--tx),var(--ty)) scale(0.15); }
          65%  { transform: translate(var(--tx),var(--ty)) scale(1.1); }
          100% { opacity:1; transform: translate(var(--tx),var(--ty)) scale(1); }
        }
        @media (min-width: 768px) {
          .bubble-corner { display: none !important; }
        }
      `}</style>

      {/* Capa de cierre al tocar fuera */}
      {openId && (
        <div onClick={close} style={{ position:'fixed', inset:0, zIndex:298 }} />
      )}

      {BUBBLES.map((bubble) => {
        const isOpen = openId === bubble.id;
        const fanPos = getFanPositions(bubble.fanDirection, bubble.subs.length);
        const anchorRight = bubble.corner.right !== undefined;

        return (
          <div
            key={bubble.id}
            className="bubble-corner"
            style={{
              position: 'fixed',
              ...bubble.corner,
              zIndex: 299,
              width: MAIN_SIZE,
              height: MAIN_SIZE,
            }}
          >
            {/* Sub-burbujas en abanico */}
            {isOpen && bubble.subs.map((sub, i) => {
              const pos = fanPos[i];
              return (
                <div
                  key={sub.path}
                  onClick={() => { navigate(sub.path); close(); }}
                  title={sub.label}
                  style={{
                    position: 'absolute',
                    top: (MAIN_SIZE - SUB_SIZE) / 2,
                    left: (MAIN_SIZE - SUB_SIZE) / 2,
                    width: SUB_SIZE,
                    height: SUB_SIZE,
                    zIndex: 300,
                    '--tx': `${pos.x}px`,
                    '--ty': `${pos.y}px`,
                    animation: `subPopIn 0.38s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s both`,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    cursor: 'pointer',
                  }}
                >
                  <GlassSphere size={SUB_SIZE} emoji={sub.emoji} isOpen={false} onClick={() => {}} />
                </div>
              );
            })}

            {/* Burbuja principal */}
            <div style={{ animation: isOpen ? 'none' : 'bubbleFloat 4s ease-in-out infinite' }}>
              <GlassSphere
                size={MAIN_SIZE}
                emoji={bubble.emoji}
                isOpen={isOpen}
                onClick={() => toggle(bubble.id)}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
