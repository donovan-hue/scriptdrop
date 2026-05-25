import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function GroupChat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const myId = user?._id || user?.id;

  useEffect(() => {
    axios.get(`${API_URL}/group-chats/${groupId}`).then(r => setGroup(r.data.data)).catch(() => {});
    axios.get(`${API_URL}/group-chats/${groupId}/messages`)
      .then(r => setMessages(r.data.data || []))
      .catch(() => {});

    const sock = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    if (myId) sock.emit('user_online', myId);
    sock.emit('join_group', groupId);

    sock.on('receive_group_message', ({ groupId: gid, message }) => {
      if (gid === groupId) setMessages(prev => [...prev, message]);
    });
    sock.on('group_user_typing', ({ userId, username }) => {
      if (userId !== myId) setTypingUsers(prev => prev.find(u => u.userId === userId) ? prev : [...prev, { userId, username }]);
    });
    sock.on('group_user_stop_typing', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    setSocket(sock);
    return () => { sock.emit('leave_group', groupId); sock.close(); };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/group-chats/${groupId}/messages`, { content: input });
      const message = res.data.data;
      setMessages(prev => [...prev, message]);
      socket?.emit('send_group_message', { groupId, message });
    } catch { }
    setInput('');
    clearTimeout(typingTimeout.current);
    socket?.emit('group_stop_typing', { groupId, userId: myId });
  };

  const handleTyping = (val) => {
    setInput(val);
    socket?.emit('group_typing', { groupId, userId: myId, username: user?.username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket?.emit('group_stop_typing', { groupId, userId: myId }), 1500);
  };

  const handleLeave = async () => {
    if (!window.confirm('¿Salir del grupo?')) return;
    await axios.delete(`${API_URL}/group-chats/${groupId}/leave`).catch(() => {});
    navigate('/social/chat');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', borderBottom: '1px solid rgba(79,172,254,0.12)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/social/chat')} style={{ background: 'none', border: 'none', color: 'rgba(10,10,20,0.65)', fontSize: 22, cursor: 'pointer', padding: 4 }}>←</button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👥</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#0a0a14', fontWeight: 600, fontSize: 14 }}>{group?.name || 'Grupo'}</div>
          <div style={{ color: 'rgba(10,10,20,0.35)', fontSize: 11 }}>
            {typingUsers.length > 0
              ? `${typingUsers.map(u => u.username).join(', ')} escribiendo...`
              : `${group?.members?.length || 0} miembros`}
          </div>
        </div>
        <button onClick={() => setShowMembers(s => !s)} style={{ background: 'rgba(79,172,254,0.07)', border: 'none', color: '#0a0a14', fontSize: 12, cursor: 'pointer', padding: '6px 12px', borderRadius: 12 }}>
          Info
        </button>
        <button onClick={handleLeave} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', padding: '6px 12px', borderRadius: 12 }}>
          Salir
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'rgba(10,10,20,0.35)', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
              <div>Empieza la conversación grupal</div>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMine = msg.author?._id?.toString() === myId?.toString() || msg.author?.toString() === myId?.toString();
            const author = msg.author;
            return (
              <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', gap: 3 }}>
                {!isMine && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
                    <img
                      src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'U')}&background=random&color=fff&size=24`}
                      alt=""
                      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ color: 'rgba(10,10,20,0.5)', fontSize: 11 }}>{author?.firstName || author?.username}</span>
                  </div>
                )}
                <div style={{
                  maxWidth: '70%', padding: '10px 14px',
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'rgba(255,255,255,0.08)',
                  color: '#0a0a14', fontSize: 14, lineHeight: 1.4,
                }}>
                  {msg.content}
                </div>
                <span style={{ color: 'rgba(10,10,20,0.35)', fontSize: 10, paddingLeft: isMine ? 0 : 6, paddingRight: isMine ? 6 : 0 }}>
                  {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Members panel */}
        {showMembers && group && (
          <div style={{ width: 220, background: '#ffffff', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: 16, overflowY: 'auto' }}>
            <div style={{ color: 'rgba(10,10,20,0.5)', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Miembros ({group.members?.length})</div>
            {group.members?.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}&background=random&color=fff&size=32`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ color: '#0a0a14', fontSize: 12, fontWeight: 600 }}>{m.firstName || m.username}</div>
                  {group.admins?.some(a => (a._id || a)?.toString() === m._id?.toString()) && (
                    <div style={{ color: '#a855f7', fontSize: 10 }}>Admin</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#ffffff', borderTop: '1px solid rgba(79,172,254,0.12)', backdropFilter: 'blur(12px)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Mensaje en ${group?.name || 'el grupo'}...`}
          style={{ flex: 1, background: 'rgba(79,172,254,0.07)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 24, padding: '10px 16px', color: '#0a0a14', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={handleSend} disabled={!input.trim()}
          style={{ width: 42, height: 42, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'rgba(255,255,255,0.08)', border: 'none', color: '#0a0a14', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ➤
        </button>
      </div>
    </div>
  );
}
