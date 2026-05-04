import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const glass = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(16px)',
  borderRadius: '20px'
};

function DeviceIcon({ browser, os }) {
  const b = (browser || '').toLowerCase();
  const o = (os || '').toLowerCase();
  if (o.includes('android') || o.includes('ios') || o.includes('iphone') || o.includes('ipad')) return '📱';
  if (b.includes('chrome')) return '🌐';
  if (b.includes('firefox')) return '🦊';
  if (b.includes('safari')) return '🧭';
  if (b.includes('edge')) return '🔷';
  return '💻';
}

function formatTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-sm p-6 rounded-3xl"
        style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-white text-sm text-center mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                ...
              </span>
            ) : 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [closingAll, setClosingAll] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: 'one'|'all', id?: string }
  const [successMsg, setSuccessMsg] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/sessions`, { headers });
      setSessions(data.sessions || []);
    } catch (err) {
      // Fallback: try twofactor sessions endpoint
      try {
        const { data } = await axios.get(`${API}/twofactor/sessions`, { headers });
        setSessions(data.data || []);
      } catch {
        setSessions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async (id) => {
    setClosingId(id);
    try {
      await axios.delete(`${API}/sessions/${id}`, { headers });
      setSessions(prev => prev.filter(s => s._id !== id));
      showSuccess('Sesion cerrada');
    } catch {
      try {
        await axios.post(`${API}/twofactor/sessions/${id}/logout`, {}, { headers });
        setSessions(prev => prev.filter(s => s._id !== id));
        showSuccess('Sesion cerrada');
      } catch {
        showSuccess('Error al cerrar la sesion');
      }
    } finally {
      setClosingId(null);
      setConfirm(null);
    }
  };

  const closeAllSessions = async () => {
    setClosingAll(true);
    try {
      await axios.delete(`${API}/sessions/all`, { headers });
      showSuccess('Todas las otras sesiones fueron cerradas');
      fetchSessions();
    } catch {
      try {
        await axios.post(`${API}/twofactor/sessions/logout-all`, {}, { headers });
        showSuccess('Todas las otras sesiones fueron cerradas');
        fetchSessions();
      } catch {
        showSuccess('Error al cerrar las sesiones');
      }
    } finally {
      setClosingAll(false);
      setConfirm(null);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={{ ...glass, padding: '28px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          📱
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">Sesiones Activas</h2>
          <p className="text-white/40 text-sm">Dispositivos conectados a tu cuenta</p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={() => setConfirm({ type: 'all' })}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
          >
            Cerrar todas las otras
          </button>
        )}
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl text-center text-sm"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }}
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Cargando sesiones...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-white/30 text-sm">No hay sesiones activas registradas</p>
          <button
            onClick={fetchSessions}
            className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            Recargar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const isCurrentMarked = session.isCurrent || index === 0;
            return (
              <motion.div
                key={session._id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  background: isCurrentMarked ? 'rgba(59,130,246,0.07)' : 'rgba(255,255,255,0.03)',
                  border: isCurrentMarked ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.07)'
                }}
              >
                {/* Device icon */}
                <div
                  className="w-11 h-11 flex items-center justify-center text-xl rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <DeviceIcon
                    browser={session.deviceInfo?.browser}
                    os={session.deviceInfo?.os}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white text-sm font-medium truncate">
                      {session.deviceInfo?.browser || 'Navegador desconocido'}
                      {session.deviceInfo?.os ? ` en ${session.deviceInfo.os}` : ''}
                    </p>
                    {isCurrentMarked && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
                      >
                        Actual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {session.ipAddress && (
                      <span className="text-white/30 text-xs">
                        {session.ipAddress}
                      </span>
                    )}
                    {(session.location?.city || session.location?.country) && (
                      <span className="text-white/30 text-xs">
                        📍 {[session.location.city, session.location.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <span className="text-white/30 text-xs">
                      {formatTime(session.lastActivityAt || session.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Close button — hide on the "current" session */}
                {!isCurrentMarked && (
                  <button
                    onClick={() => setConfirm({ type: 'one', id: session._id })}
                    disabled={closingId === session._id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 disabled:opacity-40"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                  >
                    {closingId === session._id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border border-red-300 border-t-transparent rounded-full animate-spin" />
                        ...
                      </span>
                    ) : 'Cerrar'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!loading && sessions.length > 0 && (
        <div
          className="mt-4 p-3 rounded-xl flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/30 text-xs">
            {sessions.length} sesion{sessions.length !== 1 ? 'es' : ''} activa{sessions.length !== 1 ? 's' : ''}
          </p>
          <button onClick={fetchSessions} className="text-blue-400/60 text-xs hover:text-blue-400 transition-colors">
            Actualizar
          </button>
        </div>
      )}

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            message={
              confirm.type === 'all'
                ? '¿Cerrar todas las sesiones excepto la actual? Tendras que volver a iniciar sesion en esos dispositivos.'
                : '¿Cerrar esta sesion? El dispositivo perdera acceso hasta volver a iniciar sesion.'
            }
            loading={confirm.type === 'all' ? closingAll : closingId === confirm.id}
            onConfirm={() =>
              confirm.type === 'all' ? closeAllSessions() : closeSession(confirm.id)
            }
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
