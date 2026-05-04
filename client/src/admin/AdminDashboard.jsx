import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../../src/styles/glassmorphism.css';

/* =========================================================
   Estilos inline con glassmorphism — mismos tokens CSS
   que /styles/glassmorphism.css
   ========================================================= */
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a0533 0%, #0d1b2a 50%, #1a0533 100%)',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  blurOrb1: {
    position: 'fixed',
    top: '-100px',
    left: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(179,68,255,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  blurOrb2: {
    position: 'fixed',
    bottom: '-100px',
    right: '-100px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  inner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #b344ff, #00d4ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    marginTop: '4px',
  },
  refreshBtn: {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '10px 20px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '28px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '6px',
  },
  tabBtn: (active) => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
    background: active
      ? 'linear-gradient(135deg, rgba(179,68,255,0.5), rgba(0,212,255,0.5))'
      : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
    boxShadow: active ? '0 4px 15px rgba(179,68,255,0.3)' : 'none',
    backdropFilter: active ? 'blur(20px)' : 'none',
  }),
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  statCard: (accent) => ({
    background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${accent}44`,
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(31,38,135,0.37)',
    transition: 'all 0.3s',
  }),
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: 1,
    marginBottom: '8px',
  },
  statIcon: {
    fontSize: '22px',
    marginBottom: '8px',
  },
  glassPanel: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(31,38,135,0.37)',
  },
  panelTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchBar: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: 'rgba(255,255,255,0.9)',
  },
  th: {
    background: 'rgba(255,255,255,0.06)',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'rgba(255,255,255,0.5)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(179,68,255,0.4)',
  },
  badge: (color) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: `${color}28`,
    color: color,
    border: `1px solid ${color}55`,
    display: 'inline-block',
  }),
  actionBtn: (variant) => {
    const map = {
      primary: { bg: 'rgba(179,68,255,0.2)', color: '#c97aff', border: 'rgba(179,68,255,0.4)' },
      danger:  { bg: 'rgba(255,80,80,0.15)',  color: '#ff7070', border: 'rgba(255,80,80,0.35)' },
      success: { bg: 'rgba(50,200,120,0.15)', color: '#55d989', border: 'rgba(50,200,120,0.35)' },
      warn:    { bg: 'rgba(255,190,50,0.15)', color: '#ffcd3c', border: 'rgba(255,190,50,0.35)' },
    };
    const c = map[variant] || map.primary;
    return {
      padding: '6px 14px',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.2s',
      marginRight: '6px',
      marginBottom: '4px',
      whiteSpace: 'nowrap',
    };
  },
  reportCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderLeft: '4px solid #b344ff',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s',
  },
  reportMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '180px',
  },
  reportReason: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '15px',
  },
  reportSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
  },
  orderCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px',
    padding: '18px 22px',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  orderRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  orderDetail: {
    marginTop: '12px',
    padding: '14px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
    lineHeight: '1.7',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterBtn: (active) => ({
    padding: '8px 18px',
    borderRadius: '10px',
    border: active ? '1px solid rgba(179,68,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
    background: active ? 'rgba(179,68,255,0.25)' : 'rgba(255,255,255,0.06)',
    color: active ? '#c97aff' : 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  }),
  loadingText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    padding: '40px',
    fontSize: '15px',
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    padding: '40px',
    fontSize: '15px',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  analyticsCard: (accent) => ({
    background: `linear-gradient(135deg, ${accent}22, transparent)`,
    border: `1px solid ${accent}40`,
    borderRadius: '14px',
    padding: '22px',
    textAlign: 'center',
  }),
};

/* =========================================================
   Helpers
   ========================================================= */
const roleColor = (role) => {
  if (role === 'admin') return '#b344ff';
  if (role === 'seller') return '#00d4ff';
  return '#55d989';
};
const statusColor = (s) => {
  if (!s || s === 'active') return '#55d989';
  if (s === 'suspended') return '#ff7070';
  return '#ffcd3c';
};
const reportStatusColor = (s) => {
  if (s === 'pending') return '#ffcd3c';
  if (s === 'reviewing') return '#00d4ff';
  if (s === 'resolved') return '#55d989';
  return '#aaa';
};
const orderStatusColor = (s) => {
  const map = { pending: '#ffcd3c', processing: '#00d4ff', delivered: '#55d989', cancelled: '#ff7070', completed: '#b344ff' };
  return map[s] || '#aaa';
};
const fmt = (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '—');

/* =========================================================
   TAB 1 — Overview
   ========================================================= */
function OverviewTab({ stats, analytics, loading }) {
  if (loading) return <p style={styles.loadingText}>Cargando estadisticas...</p>;

  return (
    <>
      {/* Stat cards */}
      <div style={styles.grid4}>
        <div style={styles.statCard('#b344ff')}>
          <div style={styles.statIcon}>&#128101;</div>
          <div style={styles.statLabel}>Total Usuarios</div>
          <div style={styles.statValue}>{stats?.totalUsers ?? '—'}</div>
        </div>
        <div style={styles.statCard('#00d4ff')}>
          <div style={styles.statIcon}>&#128172;</div>
          <div style={styles.statLabel}>Total Posts</div>
          <div style={styles.statValue}>{stats?.totalPosts ?? '—'}</div>
        </div>
        <div style={styles.statCard('#ff6ec7')}>
          <div style={styles.statIcon}>&#9888;</div>
          <div style={styles.statLabel}>Reportes Pendientes</div>
          <div style={styles.statValue}>{stats?.pendingReports ?? '—'}</div>
        </div>
        <div style={styles.statCard('#55d989')}>
          <div style={styles.statIcon}>&#128200;</div>
          <div style={styles.statLabel}>Actividad (7d)</div>
          <div style={styles.statValue}>{analytics ? analytics.newUsers + analytics.newPosts : '—'}</div>
        </div>
      </div>

      {/* Analytics cards */}
      {analytics && (
        <div style={styles.glassPanel}>
          <div style={styles.panelTitle}>
            <span>&#128202;</span> Analitica — {analytics.period}
          </div>
          <div style={styles.analyticsGrid}>
            <div style={styles.analyticsCard('#b344ff')}>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '8px' }}>NUEVOS USUARIOS</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>{analytics.newUsers}</div>
            </div>
            <div style={styles.analyticsCard('#00d4ff')}>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '8px' }}>NUEVOS POSTS</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>{analytics.newPosts}</div>
            </div>
            <div style={styles.analyticsCard('#ff6ec7')}>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginBottom: '8px' }}>NUEVOS REPORTES</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>{analytics.newReports}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      {stats?.recentReports?.length > 0 && (
        <div style={{ ...styles.glassPanel, marginTop: '24px' }}>
          <div style={styles.panelTitle}><span>&#128276;</span> Reportes Recientes</div>
          {stats.recentReports.map((r) => (
            <div key={r._id} style={styles.reportCard}>
              <div style={styles.reportMeta}>
                <span style={styles.reportReason}>{r.reason || 'Sin razon'}</span>
                <span style={styles.reportSub}>{r.contentType || 'post'} — {fmt(r.createdAt)}</span>
              </div>
              <span style={styles.badge(reportStatusColor(r.status))}>{r.status || 'pending'}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* =========================================================
   TAB 2 — Usuarios
   ========================================================= */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);

  const fetchUsers = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/users?search=${q}&limit=50`);
      setUsers(res.data.data || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer);
    const t = setTimeout(() => fetchUsers(val), 400);
    setSearchTimer(t);
  };

  const suspendUser = async (userId, currentStatus) => {
    const action = currentStatus === 'suspended' ? 'activar' : 'suspender';
    if (!window.confirm(`Seguro que quieres ${action} este usuario?`)) return;
    try {
      await axios.patch(`/api/admin/users/${userId}/suspend`, { reason: 'Admin action' });
      fetchUsers(search);
    } catch {
      alert('Error al realizar la accion');
    }
  };

  const changeRole = async (userId, newRole) => {
    // NOTE: endpoint no existe en admin.js — se usa orders/users generico
    // Esto es un call optimista; el backend deberia exponer PATCH /api/admin/users/:id/role
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers(search);
    } catch {
      alert('Endpoint de cambio de rol no disponible en el servidor actual.');
    }
  };

  return (
    <div style={styles.glassPanel}>
      <div style={styles.panelTitle}><span>&#128101;</span> Gestion de Usuarios</div>
      <input
        style={styles.searchBar}
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={handleSearch}
      />
      {loading ? (
        <p style={styles.loadingText}>Cargando...</p>
      ) : users.length === 0 ? (
        <p style={styles.emptyText}>No se encontraron usuarios.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['', 'Usuario', 'Email', 'Registro', 'Rol', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ transition: 'background 0.2s' }}>
                  <td style={styles.td}>
                    <img
                      src={u.avatar || 'https://via.placeholder.com/34'}
                      alt={u.username}
                      style={styles.avatar}
                    />
                  </td>
                  <td style={styles.td}><strong>{u.username}</strong></td>
                  <td style={styles.td}><span style={{ color: 'rgba(255,255,255,0.6)' }}>{u.email}</span></td>
                  <td style={styles.td}>{fmt(u.createdAt)}</td>
                  <td style={styles.td}><span style={styles.badge(roleColor(u.role))}>{u.role || 'user'}</span></td>
                  <td style={styles.td}>
                    <span style={styles.badge(statusColor(u.suspended ? 'suspended' : 'active'))}>
                      {u.suspended ? 'Suspendido' : 'Activo'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                    <button
                      style={styles.actionBtn(u.suspended ? 'success' : 'danger')}
                      onClick={() => suspendUser(u._id, u.suspended ? 'suspended' : 'active')}
                    >
                      {u.suspended ? 'Activar' : 'Suspender'}
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        style={styles.actionBtn('primary')}
                        onClick={() => changeRole(u._id, 'admin')}
                      >
                        Hacer Admin
                      </button>
                    )}
                    {u.role === 'admin' && (
                      <button
                        style={styles.actionBtn('warn')}
                        onClick={() => changeRole(u._id, 'user')}
                      >
                        Quitar Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TAB 3 — Reportes
   ========================================================= */
function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchReports = useCallback(async (s = 'pending') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/reports?status=${s}&limit=30`);
      setReports(res.data.data || []);
    } catch {
      setReports([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports(statusFilter);
  }, [fetchReports, statusFilter]);

  const handleFilter = (s) => {
    setStatusFilter(s);
    fetchReports(s);
  };

  const ignoreReport = async (reportId) => {
    try {
      await axios.patch(`/api/admin/reports/${reportId}/resolve`, { decision: 'dismissed', action: 'none' });
      fetchReports(statusFilter);
    } catch {
      alert('Error al ignorar reporte');
    }
  };

  const deleteContent = async (reportId) => {
    if (!window.confirm('Eliminar el contenido reportado?')) return;
    try {
      await axios.patch(`/api/admin/reports/${reportId}/resolve`, { decision: 'content_removed', action: 'content_removed' });
      fetchReports(statusFilter);
    } catch {
      alert('Error al eliminar contenido');
    }
  };

  const reviewReport = async (reportId) => {
    try {
      await axios.patch(`/api/admin/reports/${reportId}/review`, { notes: 'En revision por admin' });
      fetchReports(statusFilter);
    } catch {
      alert('Error al revisar reporte');
    }
  };

  const statusOptions = ['pending', 'reviewing', 'resolved'];

  return (
    <div style={styles.glassPanel}>
      <div style={styles.panelTitle}><span>&#128681;</span> Reportes de Contenido</div>
      <div style={styles.filterBar}>
        {statusOptions.map((s) => (
          <button
            key={s}
            style={styles.filterBtn(statusFilter === s)}
            onClick={() => handleFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={styles.loadingText}>Cargando reportes...</p>
      ) : reports.length === 0 ? (
        <p style={styles.emptyText}>No hay reportes con estado "{statusFilter}".</p>
      ) : (
        reports.map((r) => (
          <div key={r._id} style={styles.reportCard}>
            <div style={styles.reportMeta}>
              <span style={styles.reportReason}>{r.reason || 'Sin descripcion'}</span>
              <span style={styles.reportSub}>
                Tipo: {r.contentType || 'post'} &bull; Reportado por: {r.reportedBy?.username || 'anonimo'} &bull; {fmt(r.createdAt)}
              </span>
              {r.adminNotes && (
                <span style={{ ...styles.reportSub, color: 'rgba(0,212,255,0.7)' }}>Nota: {r.adminNotes}</span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={styles.badge(reportStatusColor(r.status))}>{r.status}</span>
              {r.status === 'pending' && (
                <button style={styles.actionBtn('primary')} onClick={() => reviewReport(r._id)}>
                  Revisar
                </button>
              )}
              {r.status !== 'resolved' && (
                <>
                  <button style={styles.actionBtn('warn')} onClick={() => ignoreReport(r._id)}>
                    Ignorar
                  </button>
                  <button style={styles.actionBtn('danger')} onClick={() => deleteContent(r._id)}>
                    Eliminar Contenido
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================================================
   TAB 4 — Ordenes
   ========================================================= */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders/restaurant-orders');
      setOrders(res.data.orders || res.data.data || []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusOptions = ['all', 'pending', 'processing', 'delivered', 'completed', 'cancelled'];

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div style={styles.glassPanel}>
      <div style={styles.panelTitle}><span>&#128230;</span> Ordenes</div>
      <div style={styles.filterBar}>
        {statusOptions.map((s) => (
          <button
            key={s}
            style={styles.filterBtn(statusFilter === s)}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={styles.loadingText}>Cargando ordenes...</p>
      ) : filtered.length === 0 ? (
        <p style={styles.emptyText}>No hay ordenes{statusFilter !== 'all' ? ` con estado "${statusFilter}"` : ''}.</p>
      ) : (
        filtered.map((o) => (
          <div key={o._id} style={styles.orderCard}>
            <div style={styles.orderRow}>
              <div>
                <strong style={{ color: '#fff', fontSize: '15px' }}>#{String(o._id).slice(-8).toUpperCase()}</strong>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '3px' }}>
                  {fmt(o.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={styles.badge(orderStatusColor(o.status))}>{o.status || 'pending'}</span>
                <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
                  ${(o.total || o.totalAmount || 0).toFixed(2)}
                </span>
                <button
                  style={styles.actionBtn('primary')}
                  onClick={() => toggleExpand(o._id)}
                >
                  {expanded === o._id ? 'Ocultar' : 'Ver Detalle'}
                </button>
              </div>
            </div>
            {expanded === o._id && (
              <div style={styles.orderDetail}>
                <div><strong>Cliente:</strong> {o.user?.username || o.customerId || '—'}</div>
                <div><strong>Direccion:</strong> {o.deliveryAddress?.street || o.deliveryAddress || '—'}</div>
                <div><strong>Metodo de pago:</strong> {o.paymentMethod || '—'}</div>
                {o.items?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Items:</strong>
                    <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                      {o.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name || item.product?.name || 'Producto'} x{item.quantity} — ${(item.price || 0).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* =========================================================
   TAB 5 — Content (posts moderation)
   ========================================================= */
function ContentTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchPosts = useCallback(async (f = 'all') => {
    setLoading(true);
    try {
      const param = f === 'all' ? '' : `?deleted=${f === 'deleted'}`;
      const res = await axios.get(`/api/admin/posts${param}`);
      setPosts(res.data.data || []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(filter); }, [fetchPosts, filter]);

  const moderatePost = async (postId, action) => {
    const label = action === 'restore' ? 'restaurar' : 'eliminar';
    if (!window.confirm(`Seguro que quieres ${label} este post?`)) return;
    try {
      await axios.patch(`/api/admin/posts/${postId}/moderate`, { action });
      fetchPosts(filter);
    } catch {
      alert('Error al moderar post');
    }
  };

  return (
    <div style={styles.glassPanel}>
      <div style={styles.panelTitle}><span>&#128221;</span> Moderacion de Contenido</div>
      <div style={styles.filterBar}>
        {['all', 'active', 'deleted'].map((s) => (
          <button key={s} style={styles.filterBtn(filter === s)} onClick={() => setFilter(s)}>
            {s === 'active' ? 'Activos' : s === 'deleted' ? 'Eliminados' : 'Todos'}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={styles.loadingText}>Cargando posts...</p>
      ) : posts.length === 0 ? (
        <p style={styles.emptyText}>No hay posts.</p>
      ) : (
        posts.map((p) => (
          <div key={p._id} style={styles.reportCard}>
            <div style={styles.reportMeta}>
              <span style={styles.reportReason}>{(p.content || '').slice(0, 120) || '(sin texto)'}</span>
              <span style={styles.reportSub}>
                Autor: {p.author?.username || '—'} &bull; {fmt(p.createdAt)} &bull; Likes: {p.likes?.length || 0}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={styles.badge(p.deleted ? '#ff7070' : '#55d989')}>
                {p.deleted ? 'Eliminado' : 'Activo'}
              </span>
              {p.deleted ? (
                <button style={styles.actionBtn('success')} onClick={() => moderatePost(p._id, 'restore')}>
                  Restaurar
                </button>
              ) : (
                <button style={styles.actionBtn('danger')} onClick={() => moderatePost(p._id, 'delete')}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
const TABS = [
  { id: 'overview', label: 'Overview', icon: '&#128200;' },
  { id: 'users',    label: 'Usuarios', icon: '&#128101;' },
  { id: 'content',  label: 'Contenido', icon: '&#128221;' },
  { id: 'reports',  label: 'Reportes', icon: '&#128681;' },
  { id: 'orders',   label: 'Ordenes',  icon: '&#128230;' },
];

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.allSettled([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/analytics?period=7'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
    } catch {
      // silently fail
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div style={styles.wrapper}>
      {/* Background orbs */}
      <div style={styles.blurOrb1} />
      <div style={styles.blurOrb2} />

      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Kronos Admin Panel</h1>
            <p style={styles.headerSubtitle}>Bienvenido, {user?.username || 'Admin'}</p>
          </div>
          <button style={styles.refreshBtn} onClick={fetchOverview}>
            &#8635; Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              style={styles.tabBtn(activeTab === t.id)}
              onClick={() => setActiveTab(t.id)}
              dangerouslySetInnerHTML={{ __html: `${t.icon}&nbsp;&nbsp;${t.label}` }}
            />
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} analytics={analytics} loading={statsLoading} />
        )}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
