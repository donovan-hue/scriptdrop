import React from 'react';
import { Link } from 'react-router-dom';

export default function SubscriptionCancel() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0528 50%, #0d1117 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        color: '#fff'
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 18,
          padding: '40px 32px',
          maxWidth: 460,
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>👋</div>
        <h1 style={{ fontSize: 24, margin: '0 0 8px', color: '#fff' }}>
          Pago cancelado
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 }}>
          No se realizó ningún cargo. Podés volver a intentarlo cuando quieras.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            to="/pricing"
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13
            }}
          >
            Ver planes
          </Link>
          <Link
            to="/feed"
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: 13
            }}
          >
            Ir al feed
          </Link>
        </div>
      </div>
    </div>
  );
}
