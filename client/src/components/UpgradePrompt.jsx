import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Banner / modal reutilizable cuando un usuario free intenta usar
 * una función Pro o llega al límite diario de posts.
 *
 * Props:
 *   - title?:      headline grande
 *   - message?:    cuerpo del banner
 *   - tier?:       'pro' | 'business' (a qué plan apunta el upgrade, default 'pro')
 *   - variant?:    'modal' | 'inline' (default 'inline')
 *   - onClose?:    handler de cerrar (sólo aplica a variant 'modal')
 *
 *   <UpgradePrompt
 *     title="Esto es Pro"
 *     message="La IA generativa requiere Kronos Pro."
 *   />
 */
export default function UpgradePrompt({
  title = 'Esta función requiere Kronos Pro',
  message = 'Mejorá tu plan para desbloquearla y eliminar el límite diario de posts.',
  tier = 'pro',
  variant = 'inline',
  onClose
}) {
  const navigate = useNavigate();

  const goToPricing = () => navigate('/pricing');

  const card = (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.10))',
        border: '1px solid rgba(168,85,247,0.4)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 16,
        padding: 20,
        color: '#fff',
        maxWidth: variant === 'modal' ? 420 : '100%',
        position: 'relative'
      }}
    >
      {variant === 'modal' && onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 18,
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 28 }}>{tier === 'business' ? '💼' : '⭐'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.4 }}>
            {message}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          onClick={goToPricing}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13
          }}
        >
          Ver planes
        </button>
        {variant === 'modal' && onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Ahora no
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        {card}
      </div>
    );
  }

  return card;
}
