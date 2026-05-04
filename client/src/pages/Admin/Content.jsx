import React, { useEffect, useState } from 'react';
import { api } from './Dashboard';

export default function Content() {
  const [posts, setPosts] = useState([]);
  const load = () => api('/posts').then((d) => setPosts(d.posts || []));
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('¿Eliminar post?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Moderación de contenido</h1>
      {posts.map((p) => (
        <div key={p._id} style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 8 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{new Date(p.createdAt).toLocaleString()}</div>
          <div>{p.text || p.content || '(sin texto)'}</div>
          <button onClick={() => del(p._id)} style={{ marginTop: 8 }}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
