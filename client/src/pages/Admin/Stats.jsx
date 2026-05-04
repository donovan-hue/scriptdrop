import React, { useEffect, useState } from 'react';
import { api } from './Dashboard';

export default function Stats() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/stats').then(setStats); }, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>Estadísticas</h1>
      <pre style={{ background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        {JSON.stringify(stats, null, 2)}
      </pre>
    </div>
  );
}
