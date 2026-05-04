import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HoloText } from '../kronos';

const API_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) navigate('/feed');
    else setError(result.message);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };
  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE}/api/auth/facebook`;
  };

  return (
    <div
      className="k-theme"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.12), transparent 50%), #08080f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <HoloText size={40}>KRONOS</HoloText>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
            Inicia sesión
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              padding: '12px 14px',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            className="k-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="k-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="k-btn-primary"
            style={{ marginTop: 6, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
            }}
          >
            Google
          </button>
          <button
            type="button"
            onClick={handleFacebookLogin}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
            }}
          >
            Facebook
          </button>
        </div>

        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13,
          }}
        >
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
