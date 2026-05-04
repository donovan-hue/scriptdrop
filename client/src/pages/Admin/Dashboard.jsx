import React, { useEffect, useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Users from './Users';
import Content from './Content';
import Stats from './Stats';
import Reports from './Reports';

function api(path) {
  const token = localStorage.getItem('token');
  return fetch(`/api/admin${path}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

function Home() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/stats').then(setStats); }, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard Admin</h1>
      {!stats ? <p>Cargando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <Card label="Usuarios" value={stats.users} />
          <Card label="Posts" value={stats.posts} />
          <Card label="Reportes pendientes" value={stats.pendingReports} />
        </div>
      )}
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div style={{ background: '#1a1a1a', color: '#fff', padding: 24, borderRadius: 12 }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <nav style={{ width: 220, padding: 16, background: '#111' }}>
        <h2>Admin</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/users">Usuarios</Link></li>
          <li><Link to="/admin/content">Contenido</Link></li>
          <li><Link to="/admin/stats">Stats</Link></li>
          <li><Link to="/admin/reports">Reportes</Link></li>
        </ul>
      </nav>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="users" element={<Users />} />
          <Route path="content" element={<Content />} />
          <Route path="stats" element={<Stats />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export { api };
