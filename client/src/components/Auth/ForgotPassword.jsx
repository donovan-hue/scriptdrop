import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HoloText } from '../kronos';

const HOLO = 'linear-gradient(135deg,#4facfe,#00f2fe,#f3a0ff,#ff85a2)';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        setMessage(data.message || 'No se pudo enviar el correo. Intenta de nuevo.');
      }
    } catch {
      setStatus('error');
      setMessage('El servidor tardó demasiado. Espera unos segundos y vuelve a intentarlo.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(79,172,254,0.08), transparent 50%), #ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🔑</div>
          <HoloText size={30}>Recuperar contraseña</HoloText>
          <div style={{ color: 'rgba(10,10,20,0.45)', fontSize: 13, marginTop: 8 }}>
            Te enviaremos un enlace a tu email
          </div>
        </div>

        {status === 'sent' ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#16a34a', padding: '18px', borderRadius: 14, textAlign: 'center', fontSize: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📧</div>
            <strong>¡Listo!</strong> Si ese email existe, recibirás el enlace en unos minutos.
            <div style={{ marginTop: 16 }}>
              <Link to="/login" style={{ background: HOLO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700, textDecoration: 'none' }}>
                Volver al login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14 }}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 12, outline: 'none',
                  background: 'rgba(79,172,254,0.05)', border: '1.5px solid rgba(79,172,254,0.2)',
                  color: '#0a0a14', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <button type="submit" disabled={status === 'loading'} style={{
                padding: '14px', borderRadius: 12, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                background: HOLO, color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', letterSpacing: 1, opacity: status === 'loading' ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(79,172,254,0.3)',
              }}>
                {status === 'loading' ? 'Enviando...' : 'ENVIAR ENLACE'}
              </button>
            </form>
            <div style={{ marginTop: 24, textAlign: 'center', color: 'rgba(10,10,20,0.45)', fontSize: 13 }}>
              <Link to="/login" style={{ background: HOLO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textDecoration: 'none', fontWeight: 700 }}>
                ← Volver al login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
