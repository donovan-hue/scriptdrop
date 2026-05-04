import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

export default function TipModal({ isOpen, onClose, targetUser, targetId, targetType }) {
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleSend = async () => {
    if (amount < 1) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/tips/send`, {
        toUserId: targetUser._id,
        amount,
        targetId,
        targetType,
        message,
        anonymous
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar propina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            {success ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-white text-lg font-semibold">Propina enviada!</p>
                <p className="text-white/50 text-sm mt-1">{amount} KRO para @{targetUser?.username}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold text-lg">Enviar Propina 💎</h3>
                  <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
                </div>

                {/* Target user */}
                <div className="flex items-center gap-3 mb-5 p-3 bg-white/5 rounded-xl">
                  <img
                    src={targetUser?.avatar || `https://ui-avatars.com/api/?name=${targetUser?.username}&background=7c3aed&color=fff`}
                    alt={targetUser?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">@{targetUser?.username}</p>
                    <p className="text-white/40 text-xs">Recibira tokens KRO</p>
                  </div>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 mb-4">
                  {QUICK_AMOUNTS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      className={`flex-1 py-2 text-sm rounded-xl border transition-all ${
                        amount === a
                          ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                          : 'border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="mb-4">
                  <label className="text-white/50 text-xs mb-1 block">Cantidad personalizada (KRO)</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Message */}
                <textarea
                  placeholder="Mensaje (opcional)..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={200}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-purple-500/50 mb-4 placeholder-white/20"
                />

                {/* Anonymous toggle */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white/50 text-sm">Enviar anonimamente</span>
                  <button
                    onClick={() => setAnonymous(!anonymous)}
                    className={`w-12 h-6 rounded-full transition-all ${anonymous ? 'bg-purple-500' : 'bg-white/20'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${anonymous ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

                <button
                  onClick={handleSend}
                  disabled={loading || amount < 1}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                >
                  {loading ? 'Enviando...' : `Enviar ${amount} KRO 💎`}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
