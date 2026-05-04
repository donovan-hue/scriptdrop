import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const TYPE_COLORS = {
  battle: 'from-red-500 to-orange-500',
  collab: 'from-blue-500 to-cyan-500',
  quiz: 'from-yellow-500 to-amber-500',
  challenge: 'from-purple-500 to-pink-500',
  auction: 'from-green-500 to-emerald-500'
};
const TYPE_ICONS = { battle: '⚔️', collab: '🤝', quiz: '❓', challenge: '🎯', auction: '🔨' };

function CountdownTimer({ endTime, startTime }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const target = new Date(now < new Date(startTime) ? startTime : endTime).getTime();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('Terminado'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [endTime, startTime]);
  return <span>{timeLeft}</span>;
}

export default function BlackHoleEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [joining, setJoining] = useState(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/blackhole`, { headers });
      setEvents(data.events);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const handleJoin = async (eventId) => {
    setJoining(eventId);
    try {
      await axios.post(`${API}/blackhole/${eventId}/join`, {}, { headers });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al unirse');
    } finally { setJoining(null); }
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.eventType === filter);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            🕳️ Eventos Agujero Negro
          </h2>
          <p className="text-white/40 text-sm">Eventos efimeros con premios KRO</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all"
        >
          + Crear
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all', 'battle', 'collab', 'quiz', 'challenge', 'auction'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
              filter === f ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            {f === 'all' ? 'Todos' : `${TYPE_ICONS[f]} ${f}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🕳️</div>
          <p className="text-white/30">No hay eventos activos</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 text-purple-400 text-sm hover:text-purple-300">
            Crea el primero
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(event => (
            <EventCard key={event._id} event={event} onJoin={handleJoin} joining={joining === event._id} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={fetchEvents} headers={headers} />}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ event, onJoin, joining }) {
  const isLive = event.status === 'live';
  const gradient = TYPE_COLORS[event.eventType] || TYPE_COLORS.challenge;
  const fill = event.maxParticipants > 0 ? (event.participantCount / event.maxParticipants) * 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative p-4 bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
    >
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 text-xs font-bold">EN VIVO</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
          {TYPE_ICONS[event.eventType]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{event.title}</h3>
          <p className="text-white/40 text-xs">@{event.creator?.username}</p>
        </div>
      </div>

      {event.description && (
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{event.description}</p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-white text-sm font-bold">{event.prizePool} KRO</p>
          <p className="text-white/30 text-xs">Premio</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-white text-sm font-bold">{event.participantCount}</p>
          <p className="text-white/30 text-xs">Participantes</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-white text-sm font-bold">
            <CountdownTimer startTime={event.startTime} endTime={event.endTime} />
          </p>
          <p className="text-white/30 text-xs">{event.status === 'upcoming' ? 'Inicia en' : 'Termina en'}</p>
        </div>
      </div>

      {/* Participant fill bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/30 mb-1">
          <span>{event.participantCount}/{event.maxParticipants}</span>
          <span>{Math.round(fill)}% lleno</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`} style={{ width: `${fill}%` }} />
        </div>
      </div>

      <button
        onClick={() => onJoin(event._id)}
        disabled={joining || event.userJoined || event.isFull || event.status === 'ended'}
        className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${
          event.userJoined ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default' :
          event.isFull ? 'bg-white/5 text-white/20 cursor-not-allowed' :
          event.status === 'ended' ? 'bg-white/5 text-white/20 cursor-not-allowed' :
          `bg-gradient-to-r ${gradient} text-white hover:opacity-90`
        }`}
      >
        {joining ? 'Uniendose...' :
          event.userJoined ? '✓ Inscrito' :
          event.isFull ? 'Lleno' :
          event.status === 'ended' ? 'Finalizado' :
          event.entryFee > 0 ? `Unirse — ${event.entryFee} KRO` : 'Unirse Gratis'}
      </button>
    </motion.div>
  );
}

function CreateEventModal({ onClose, onCreated, headers }) {
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    maxParticipants: 100, prizePool: 0, entryFee: 0,
    eventType: 'challenge', rules: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.startTime || !form.endTime) {
      setError('Titulo, fecha de inicio y fin son requeridos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/blackhole`, form, { headers });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creando evento');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="w-full max-w-md bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-bold text-lg">🕳️ Crear Evento Agujero Negro</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            placeholder="Nombre del evento" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder-white/20" />

          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Descripcion (opcional)" rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-purple-500/50 placeholder-white/20" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Inicio</label>
              <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Fin</label>
              <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" />
            </div>
          </div>

          <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50">
            {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Max. participantes</label>
              <input type="number" min={1} value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Premio KRO</label>
              <input type="number" min={0} value={form.prizePool} onChange={e => setForm({...form, prizePool: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Entrada KRO</label>
              <input type="number" min={0} value={form.entryFee} onChange={e => setForm({...form, entryFee: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all hover:opacity-90">
            {loading ? 'Creando...' : 'Crear Evento'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
