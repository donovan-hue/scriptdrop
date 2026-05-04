import React, { useEffect, useState } from 'react';
import { api } from './Dashboard';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');

  const load = () => api(`/users?q=${encodeURIComponent(q)}`).then((d) => setUsers(d.users || []));
  useEffect(() => { load(); }, []);

  const action = async (path, method = 'PATCH') => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Usuarios</h1>
      <div>
        <input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={load}>Buscar</button>
      </div>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead><tr><th>Usuario</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ borderBottom: '1px solid #333' }}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.banned ? '🚫 Baneado' : '✅ Activo'}</td>
              <td>
                {u.banned
                  ? <button onClick={() => action(`/users/${u._id}/unban`)}>Desbanear</button>
                  : <button onClick={() => action(`/users/${u._id}/ban`)}>Banear</button>}
                <button onClick={() => { if (confirm('¿Eliminar?')) action(`/users/${u._id}`, 'DELETE'); }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
