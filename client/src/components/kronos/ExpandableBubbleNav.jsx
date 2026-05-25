import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// 4 burbujas principales en esquinas con sus sub-burbujas
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
      { emoji: '💬', label: 'Chat',         path: '/social/chat' },
      { emoji: '👥', label: 'Grupos',       path: '/social/groups' },
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

// Calcula posición de cada sub-burbuja en abanico según dirección
function getFanPositions(direction, count) {
  const positions = [];
  let startAngle, endAngle;

  if (direction === 'up-right') {
    startAngle = 270; // arriba
    endAngle = 0;     // derecha
  } else {
    startAngle = 270; // arriba
    endAngle = 180;   // izquierda
  }

  // Para up-right: de 270 a 360 (o sea -90 a 0 grados)
  // Para up-left: de 270 a 180 (o sea -90 a -180 grados)
  const range = direction === 'up-right' ? 80 : -80;
  const radius = 90;

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = ((startAngle + range * t) * Math.PI) / 180;
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return positions;
}

const BUBBLE_SIZE = 52;
const SUB_SIZE = 44;

export default function ExpandableBubbleNav() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [openId, setOpenId] = useState(null);

  if (!user) return null;

  const toggle = (id) => setOpenId(prev => (prev === id ? null : id));
  const close = () => setOpenId(null);

  return (
    <>
      <style>{`
        @keyframes subPop {
          0%   { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0.2); }
          70%  { transform: translate(var(--tx), var(--ty)) scale(1.12); }
          100% { opacity: 1; transform: translate(var(--tx), var(--ty)) scale(1); }
        }
        @keyframes bubblePulse {
          0%,100% { box-shadow: 0 4px 18px rgba(124,58,237,0.35), 0 0 0 0 rgba(124,58,237,0.2); }
          50%      { box-shadow: 0 6px 24px rgba(6,182,212,0.45), 0 0 0 6px rgba(6,182,212,0.08); }
        }
      `}</style>

      {/* Tap fuera para cerrar */}
      {openId && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 298 }}
        />
      )}

      {BUBBLES.map((bubble) => {
        const isOpen = openId === bubble.id;
        const fanPositions = getFanPositions(bubble.fanDirection, bubble.subs.length);

        return (
          <div
            key={bubble.id}
            style={{
              position: 'fixed',
              ...bubble.corner,
              zIndex: 299,
              // solo visible en móvil
              display: 'block',
            }}
            className="bubble-nav-corner"
          >
            {/* Sub-burbujas */}
            {isOpen && bubble.subs.map((sub, i) => {
              const pos = fanPositions[i];
              return (
                <div
                  key={sub.path}
                  onClick={() => { navigate(sub.path); close(); }}
                  title={sub.label}
                  style={{
                    position: 'absolute',
                    bottom: BUBBLE_SIZE / 2 - SUB_SIZE / 2,
                    // ancla al centro de la burbuja principal
                    left: bubble.corner.right !== undefined
                      ? undefined
                      : BUBBLE_SIZE / 2 - SUB_SIZE / 2,
                    right: bubble.corner.right !== undefined
                      ? BUBBLE_SIZE / 2 - SUB_SIZE / 2
                      : undefined,
                    width: SUB_SIZE,
                    height: SUB_SIZE,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(139,92,246,0.18) 60%, rgba(6,182,212,0.12))',
                    border: '1.5px solid rgba(139,92,246,0.35)',
                    backdropFilter: 'blur(14px)',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    cursor: 'pointer',
                    zIndex: 300,
                    '--tx': `${pos.x}px`,
                    '--ty': `${pos.y}px`,
                    '--sx': '0px',
                    '--sy': '0px',
                    animation: `subPop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.055}s both`,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                  }}
                >
                  {sub.emoji}
                </div>
              );
            })}

            {/* Burbuja principal */}
            <div
              onClick={() => toggle(bubble.id)}
              style={{
                width: BUBBLE_SIZE,
                height: BUBBLE_SIZE,
                borderRadius: '50%',
                background: isOpen
                  ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(124,58,237,0.35) 60%, rgba(6,182,212,0.25))'
                  : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), rgba(139,92,246,0.22) 60%, rgba(6,182,212,0.15))',
                border: isOpen
                  ? '2px solid rgba(124,58,237,0.6)'
                  : '1.5px solid rgba(139,92,246,0.4)',
                backdropFilter: 'blur(16px)',
                boxShadow: isOpen
                  ? '0 0 24px rgba(124,58,237,0.5), 0 0 48px rgba(6,182,212,0.2), inset 0 1px 0 rgba(255,255,255,0.6)'
                  : '0 4px 18px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                cursor: 'pointer',
                userSelect: 'none',
                animation: 'bubblePulse 3s ease-in-out infinite',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isOpen ? 'scale(1.15)' : 'scale(1)',
                position: 'relative',
              }}
            >
              {/* Brillo superior */}
              <div style={{
                position: 'absolute', top: 8, left: 11,
                width: 18, height: 9, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              {bubble.emoji}
            </div>
          </div>
        );
      })}

      {/* Ocultar en desktop (sidebar ya cubre navegación) */}
      <style>{`
        @media (min-width: 768px) {
          .bubble-nav-corner { display: none !important; }
        }
      `}</style>
    </>
  );
}
