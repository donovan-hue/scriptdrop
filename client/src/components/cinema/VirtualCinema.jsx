import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = process.env.REACT_APP_API_URL;
const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const REACTIONS = ['❤️', '😂', '😮', '👏', '🔥', '😢'];

function VideoPlayer({ videoUrl, currentTime, isPlaying, isHost, onSync }) {
  const videoRef = useRef(null);
  const [localPlaying, setLocalPlaying] = useState(isPlaying);
  const syncLock = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const diff = Math.abs(video.currentTime - currentTime);
    if (diff > 2) video.currentTime = currentTime;
    if (isPlaying) video.play().catch(() => {});
    else video.pause();
  }, [currentTime, isPlaying]);

  const handlePlayPause = () => {
    if (!isHost) return;
    const video = videoRef.current;
    const newPlaying = !localPlaying;
    setLocalPlaying(newPlaying);
    onSync(video.currentTime, newPlaying);
  };

  const handleTimeUpdate = () => {
    if (!isHost || syncLock.current) return;
    syncLock.current = true;
    setTimeout(() => { syncLock.current = false; }, 5000);
    onSync(videoRef.current.currentTime, localPlaying);
  };

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayPause}
        style={{ cursor: isHost ? 'pointer' : 'default' }}
      />
      {!isHost && (
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded-lg text-white/60 text-xs">
          Solo el host puede controlar la reproduccion
        </div>
      )}
      {isHost && (
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-purple-500/60 rounded-lg text-white text-xs">
          Host — Haz clic para pausar/reproducir
        </div>
      )}
    </div>
  );
}

export default function VirtualCinema() {
  const [view, setView] = useState('lobby'); // lobby | room
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [syncState, setSyncState] = useState({ currentTime: 0, isPlaying: false });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [reactions, setReactions] = useState([]);
  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchRooms(); }, []);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/cinema`, { headers });
      setRooms(data.rooms);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  const joinRoom = async (roomId) => {
    try {
      const { data } = await axios.post(`${API}/cinema/${roomId}/join`, {}, { headers });
      setCurrentRoom(data.room);
      setSyncState({ currentTime: data.currentTime, isPlaying: data.isPlaying });
      setChatMessages(data.room.chat?.slice(-50) || []);
      connectSocket(roomId);
      setView('room');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al unirse');
    }
  };

  const connectSocket = useCallback((roomId) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.emit('join_cinema_room', { roomId, userId: user._id, username: user.username });

    socket.on('cinema_sync', ({ currentTime, isPlaying }) => {
      setSyncState({ currentTime, isPlaying });
    });

    socket.on('cinema_chat', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on('cinema_reaction', (reaction) => {
      const id = Date.now();
      setReactions(prev => [...prev, { ...reaction, id }]);
      setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
    });

    socket.on('cinema_user_joined', ({ username }) => {
      setChatMessages(prev => [...prev, { username: 'Sistema', message: `${username} se unio`, isSystem: true }]);
    });
  }, [token, user._id, user.username]);

  const handleSync = async (currentTime, isPlaying) => {
    try {
      await axios.patch(`${API}/cinema/${currentRoom._id}/sync`, { currentTime, isPlaying }, { headers });
      socketRef.current?.emit('cinema_sync', { roomId: currentRoom._id, currentTime, isPlaying });
    } catch {}
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !currentRoom) return;
    try {
      await axios.post(`${API}/cinema/${currentRoom._id}/chat`, { message: chatInput }, { headers });
      socketRef.current?.emit('cinema_chat_message', { roomId: currentRoom._id, username: user.username, message: chatInput });
      setChatMessages(prev => [...prev, { username: user.username, message: chatInput }]);
      setChatInput('');
    } catch {}
  };

  const sendReaction = (emoji) => {
    socketRef.current?.emit('cinema_reaction', { roomId: currentRoom._id, username: user.username, emoji });
    const id = Date.now();
    setReactions(prev => [...prev, { emoji, username: user.username, id }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave_cinema_room', { roomId: currentRoom._id, userId: user._id });
    socketRef.current?.disconnect();
    socketRef.current = null;
    setCurrentRoom(null);
    setView('lobby');
    fetchRooms();
  };

  const isHost = currentRoom?.host?._id === user._id || currentRoom?.host === user._id;

  return (
    <div className="w-full h-full">
      {view === 'lobby' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-bold">🎬 Cine Virtual</h2>
              <p className="text-white/40 text-sm">Ve videos en sincronizacion con tus amigos</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white text-sm font-bold">
              + Crear sala
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-white/30">No hay salas activas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map(room => (
                <div key={room._id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm truncate flex-1">{room.name}</h3>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${room.status === 'playing' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}`}>
                      {room.status === 'playing' ? '▶ En vivo' : '⏸ Esperando'}
                    </span>
                  </div>
                  {room.videoTitle && <p className="text-white/50 text-xs mb-2 truncate">{room.videoTitle}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">👥 {room.participantCount}/{room.maxParticipants}</span>
                    <button onClick={() => joinRoom(room._id)} disabled={room.isFull}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs rounded-full border border-red-500/30 transition-all disabled:opacity-40">
                      {room.isFull ? 'Llena' : 'Entrar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Video side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={leaveRoom} className="text-white/50 hover:text-white text-sm">← Salir</button>
              <h3 className="text-white font-semibold">{currentRoom?.name}</h3>
              {isHost && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">Host</span>}
            </div>
            <VideoPlayer
              videoUrl={currentRoom?.videoUrl}
              currentTime={syncState.currentTime}
              isPlaying={syncState.isPlaying}
              isHost={isHost}
              onSync={handleSync}
            />
            {/* Reactions bar */}
            <div className="flex gap-2 mt-3">
              {REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => sendReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
              ))}
            </div>
            {/* Floating reactions */}
            <div className="fixed bottom-20 right-8 pointer-events-none">
              <AnimatePresence>
                {reactions.map(r => (
                  <motion.div key={r.id}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -100, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5 }}
                    className="text-3xl mb-1"
                  >
                    {r.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat side */}
          <div className="w-full lg:w-72 flex flex-col h-80 lg:h-auto bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <p className="text-white/60 text-sm font-medium">Chat en vivo</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.isSystem ? 'text-center' : ''}>
                  {msg.isSystem ? (
                    <span className="text-white/30 text-xs">{msg.message}</span>
                  ) : (
                    <div>
                      <span className="text-purple-400 text-xs font-medium">{msg.username}: </span>
                      <span className="text-white/70 text-xs">{msg.message}</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Mensaje..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none placeholder-white/20" />
              <button onClick={sendChat} className="px-3 py-2 bg-red-500/30 text-red-300 rounded-lg text-xs hover:bg-red-500/50 transition-all">→</button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={(room) => { joinRoom(room._id); setShowCreate(false); }} headers={headers} />}
      </AnimatePresence>
    </div>
  );
}

function CreateRoomModal({ onClose, onCreated, headers }) {
  const [form, setForm] = useState({ name: '', videoUrl: '', videoTitle: '', isPrivate: false, maxParticipants: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.videoUrl) { setError('Nombre y URL de video son requeridos'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/cinema`, form, { headers });
      onCreated(data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="w-full max-w-sm bg-[#0f0f1a] border border-white/10 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-bold">🎬 Nueva Sala</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            placeholder="Nombre de la sala" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder-white/20" />
          <input value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})}
            placeholder="URL del video (MP4, YouTube embed, etc.)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder-white/20" />
          <input value={form.videoTitle} onChange={e => setForm({...form, videoTitle: e.target.value})}
            placeholder="Titulo del video (opcional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder-white/20" />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-bold text-sm disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear y Entrar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
