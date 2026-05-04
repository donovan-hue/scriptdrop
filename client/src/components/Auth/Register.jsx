import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HoloText } from '../kronos';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );
    if (result.success) navigate('/feed');
    else setError(result.message);
  };

  return (
    <div
      className="k-theme"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 70% 20%, rgba(6,182,212,0.1), transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(124,58,237,0.12), transparent 50%), #08080f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <HoloText size={36}>KRONOS</HoloText>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
            Crea tu cuenta
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              className="k-input"
              name="firstName"
              placeholder="Nombre"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              className="k-input"
              name="lastName"
              placeholder="Apellido"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <input
            className="k-input"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            className="k-input"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="k-input"
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="k-btn-primary"
            style={{ marginTop: 6, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creando...' : 'REGISTRARSE'}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 13,
          }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
