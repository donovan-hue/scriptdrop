import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedAdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #1a0533 0%, #0d1b2a 100%)',
          color: '#fff',
          fontSize: '18px',
          gap: '12px'
        }}
      >
        <span
          style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}
        >
          &#9881;
        </span>
        Verificando permisos...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/social" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
