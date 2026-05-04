import React, { useEffect, useState } from 'react';
import { api } from './Dashboard';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const load = () => api('/reports').then((d) => setReports(d.reports || []));
  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/reports/${id}/resolve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Reportes</h1>
      {reports.length === 0 && <p>Sin reportes pendientes</p>}
      {reports.map((r) => (
        <div key={r._id} style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 8 }}>
          <div><strong>{r.reason}</strong> — {r.status}</div>
          <div style={{ opacity: 0.7 }}>{r.targetType} #{r.targetId}</div>
          {r.status !== 'resolved' && <button onClick={() => resolve(r._id)}>Resolver</button>}
        </div>
      ))}
    </div>
  );
}
