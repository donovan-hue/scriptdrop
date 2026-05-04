import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Badge que muestra el tier del usuario en la Navbar.
 *   - free  → link sutil "Upgrade"
 *   - pro   → badge PRO dorado
 *   - business → badge BIZ azul
 */
export default function TierBadge({ tier = 'free' }) {
  if (tier === 'pro') {
    return (
      <span
        title="Kronos Pro"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'linear-gradient(135deg, #facc15, #f59e0b)',
          color: '#1f1300',
          fontSize: 10,
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: 6,
          letterSpacing: 1,
          textTransform: 'uppercase'
        }}
      >
        ⭐ Pro
      </span>
    );
  }

  if (tier === 'business') {
    return (
      <span
        title="Kronos Business"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: 6,
          letterSpacing: 1,
          textTransform: 'uppercase'
        }}
      >
        💼 Biz
      </span>
    );
  }

  // free
  return (
    <Link
      to="/pricing"
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        padding: '3px 8px',
        borderRadius: 6,
        border: '1px dashed rgba(255,255,255,0.25)',
        letterSpacing: 1
      }}
    >
      UPGRADE
    </Link>
  );
}
