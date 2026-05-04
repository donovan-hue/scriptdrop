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

export default function TwoFactorSetup() {
  const [status, setStatus] = useState(null); // null | 'enabled' | 'disabled'
  const [step, setStep] = useState('idle'); // idle | setup | verify | success | disabling
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Detect current 2FA status via user data stored locally
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setStatus(user.twoFactorEnabled ? 'enabled' : 'disabled');
    } catch {
      setStatus('disabled');
    }
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/twofactor/setup-totp`, {}, { headers });
      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setBackupCodes(data.data.backupCodes || []);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) { setError('Ingresa el codigo de 6 digitos'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/twofactor/verify-totp`, { secret, token: code, backupCodes }, { headers });
      // Update local user data
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, twoFactorEnabled: true }));
      } catch {}
      setStatus('enabled');
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Codigo invalido');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword) { setError('Ingresa tu contrasena'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/twofactor/disable`, { password: disablePassword }, { headers });
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, twoFactorEnabled: false }));
      } catch {}
      setStatus('disabled');
      setStep('idle');
      setDisablePassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Contrasena incorrecta');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetFlow = () => {
    setStep('idle');
    setCode('');
    setError('');
    setQrCode(null);
    setSecret(null);
    setBackupCodes([]);
    setDisablePassword('');
  };

  if (status === null) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ ...glass, padding: '28px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          🔐
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Autenticacion en dos pasos</h2>
          <p className="text-white/40 text-sm">
            {status === 'enabled' ? 'Activa — tu cuenta esta protegida' : 'Inactiva — agrega una capa de seguridad extra'}
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={
              status === 'enabled'
                ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }
                : { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }
            }
          >
            {status === 'enabled' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* === IDLE STATE === */}
        {step === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {status === 'disabled' ? (
              <div>
                <div
                  className="p-4 rounded-xl mb-5"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
                >
                  <p className="text-white/60 text-sm leading-relaxed">
                    La autenticacion en dos pasos (2FA) agrega una capa de seguridad extra a tu cuenta.
                    Cada vez que inicies sesion, necesitaras un codigo de 6 digitos generado por tu app de autenticacion.
                  </p>
                </div>
                <button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: 'white' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Configurando...
                    </span>
                  ) : 'Activar 2FA con Google Authenticator'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
                >
                  <p className="text-white/60 text-sm">
                    Tu cuenta esta protegida con autenticacion en dos pasos. Cada inicio de sesion
                    requiere un codigo de tu app de autenticacion.
                  </p>
                </div>
                <button
                  onClick={() => setStep('disabling')}
                  className="w-full py-3 rounded-xl font-medium text-sm transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                >
                  Desactivar 2FA
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* === VERIFY / SCAN QR === */}
        {step === 'verify' && (
          <motion.div key="verify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-5">
              {/* Step 1: Scan QR */}
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
                  Paso 1 — Escanea el codigo QR con tu app
                </p>
                {qrCode && (
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-white rounded-2xl">
                      <img src={qrCode} alt="2FA QR Code" className="w-44 h-44" />
                    </div>
                  </div>
                )}
                {secret && (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl mt-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div>
                      <p className="text-white/30 text-xs mb-0.5">Clave secreta manual</p>
                      <p className="text-white/70 text-xs font-mono tracking-widest">{secret}</p>
                    </div>
                    <button
                      onClick={copySecret}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}
                    >
                      {copied ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Enter code */}
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
                  Paso 2 — Ingresa el codigo de 6 digitos
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 rounded-xl focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
              </div>

              {/* Backup codes */}
              {backupCodes.length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
                >
                  <p className="text-yellow-300/80 text-xs font-bold mb-2">
                    Guarda tus codigos de respaldo (no los pierdas)
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {backupCodes.map((c, i) => (
                      <span key={i} className="font-mono text-xs text-white/50 bg-white/5 rounded-lg px-2 py-1 text-center">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={resetFlow}
                  className="flex-1 py-3 rounded-xl font-medium text-sm text-white/40 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length < 6}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: 'white' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : 'Confirmar y Activar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* === SUCCESS === */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-white font-bold text-xl mb-2">2FA Activado</h3>
            <p className="text-white/50 text-sm mb-6">
              Tu cuenta ahora esta protegida con autenticacion en dos pasos.
            </p>
            <button
              onClick={resetFlow}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#c4b5fd'
              }}
            >
              Aceptar
            </button>
          </motion.div>
        )}

        {/* === DISABLING === */}
        {step === 'disabling' && (
          <motion.div key="disabling" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <p className="text-white/60 text-sm">
                  Para desactivar 2FA ingresa tu contrasena actual como confirmacion de seguridad.
                </p>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-2">Contrasena actual</label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={e => { setDisablePassword(e.target.value); setError(''); }}
                  placeholder="Tu contrasena"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleDisable()}
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={resetFlow}
                  className="flex-1 py-3 rounded-xl font-medium text-sm text-white/40 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : 'Desactivar 2FA'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
