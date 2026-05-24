import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


function StoryRing({ group, onOpen, isMine }) {
  const { author, hasUnviewed } = group;
  const name = author.firstName || author.username;
  const ringStyle = hasUnviewed
    ? { background: 'linear-gradient(135deg,#ec4899,#7c3aed,#06b6d4)', padding: 2 }
    : { background: 'rgba(255,255,255,0.15)', padding: 2 };

  return (
    <div
      onClick={() => onOpen(group)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', minWidth: 64 }}
    >
      <div style={{ ...ringStyle, borderRadius: '50%' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ffffff', padding: 2 }}>
          <img
            src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=52`}
            alt={name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {isMine ? 'Tu historia' : name}
      </span>
    </div>
  );
}

function AddStoryButton({ onAdd }) {
  return (
    <div
      onClick={onAdd}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', minWidth: 64 }}
    >
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '2px dashed rgba(124,58,237,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        +
      </div>
      <span style={{ color: 'rgba(10,10,20,0.5)', fontSize: 10 }}>Añadir</span>
    </div>
  );
}

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

function StoryViewer({ group, onClose, currentUser }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [floatingEmoji, setFloatingEmoji] = useState(null);
  const timerRef = useRef(null);
  const emojiTimerRef = useRef(null);
  const story = group.stories[current];
  const DURATION = 5000;
  const isMyStory = group.author._id === (currentUser?._id || currentUser?.id);

  const handleDeleteStory = async (e) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta historia?')) return;
    try {
      await axios.delete(`${API_URL}/ephemeral-stories/${story._id}`);
      if (current < group.stories.length - 1) setCurrent(c => c + 1);
      else onClose();
    } catch {}
  };

  const sendReaction = async (emoji) => {
    // Muestra animación
    setFloatingEmoji(emoji);
    clearTimeout(emojiTimerRef.current);
    emojiTimerRef.current = setTimeout(() => setFloatingEmoji(null), 1200);

    // Envía como DM al autor
    try {
      await axios.post(`${API_URL}/chat/send`, {
        to: group.author._id,
        message: emoji,
        type: 'story_reaction',
        storyId: story._id,
      });
    } catch {
      // silencioso — la animación igual se muestra
    }
  };

  useEffect(() => {
    if (!story) return;
    axios.post(`${API_URL}/ephemeral-stories/${story._id}/view`).catch(() => {});
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current);
        if (current < group.stories.length - 1) setCurrent(c => c + 1);
        else onClose();
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [current, story]);

  if (!story) return null;

  const bgStyle = story.mediaUrl
    ? { backgroundImage: `url(${story.mediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: story.bgColor || '#7c3aed' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#000'
      }}
      onClick={e => {
        const x = e.clientX;
        if (x < window.innerWidth / 2) {
          if (current > 0) setCurrent(c => c - 1);
        } else {
          if (current < group.stories.length - 1) setCurrent(c => c + 1);
          else onClose();
        }
      }}
    >
      {/* Progress bars */}
      <div style={{ position: 'absolute', top: 16, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 1 }}>
        {group.stories.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: '#fff',
              width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
              transition: i === current ? 'none' : 'none'
            }} />
          </div>
        ))}
      </div>

      {/* Author */}
      <div style={{ position: 'absolute', top: 32, left: 16, display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
        <img
          src={group.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.author.firstName || group.author.username)}&background=7c3aed&color=fff&size=40`}
          alt=""
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #fff' }}
        />
        <div>
          <div style={{ color: '#0a0a14', fontSize: 13, fontWeight: 700 }}>{group.author.firstName} {group.author.lastName}</div>
          <div style={{ color: 'rgba(10,10,20,0.65)', fontSize: 11 }}>
            {new Date(story.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Close + Delete */}
      <div style={{ position: 'absolute', top: 32, right: 16, display: 'flex', gap: 8, zIndex: 1 }}>
        {isMyStory && (
          <button onClick={handleDeleteStory}
            style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)', color: '#0a0a14', fontSize: 14, cursor: 'pointer', borderRadius: 20, padding: '4px 10px', backdropFilter: 'blur(4px)' }}
            title="Eliminar historia">
            🗑️
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      {/* Floating emoji animation */}
      {floatingEmoji && (
        <div style={{
          position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)',
          fontSize: 48, zIndex: 2, animation: 'floatUp 1.2s ease-out forwards', pointerEvents: 'none',
        }}>
          {floatingEmoji}
        </div>
      )}

      {/* Reaction bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8, zIndex: 2,
          background: 'rgba(0,0,0,0.5)', borderRadius: 40, padding: '8px 16px',
          backdropFilter: 'blur(8px)',
        }}
      >
        {REACTION_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            style={{
              background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
              transition: 'transform 0.15s', padding: '4px',
              lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Story content */}
      <div style={{ width: '100%', maxWidth: 400, aspectRatio: '9/16', ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, position: 'relative' }}>
        {story.mediaType === 'video' && story.mediaUrl && (
          <video src={story.mediaUrl} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {story.text && (
          <div style={{
            position: story.mediaUrl ? 'absolute' : 'relative',
            bottom: story.mediaUrl ? 40 : 'auto',
            left: 0, right: 0,
            textAlign: 'center',
            color: '#fff', fontSize: 22, fontWeight: 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            padding: '0 24px'
          }}>
            {story.text}
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCreator({ onClose, onCreated }) {
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#7c3aed');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  const handleCreate = async () => {
    if (!text.trim() && !file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      if (text) fd.append('text', text);
      fd.append('bgColor', bgColor);
      if (file) {
        fd.append('media', file);
        fd.append('mediaType', file.type.startsWith('video') ? 'video' : 'image');
      } else {
        fd.append('mediaType', 'text');
      }
      await axios.post(`${API_URL}/ephemeral-stories`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onCreated();
      onClose();
    } catch (e) {
      // silenced;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#13131f', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: 28, width: '90%', maxWidth: 380 }}>
        <div style={{ color: '#0a0a14', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nueva Historia</div>

        {/* Preview */}
        <div style={{ width: '100%', aspectRatio: '9/16', maxHeight: 220, background: bgColor, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
          {file && <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {text && <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center', padding: '0 16px', position: file ? 'absolute' : 'relative', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{text}</div>}
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe algo..."
          maxLength={300}
          style={{ width: '100%', background: 'rgba(79,172,254,0.07)', border: '1px solid rgba(79,172,254,0.18)', borderRadius: 10, padding: '10px 14px', color: '#0a0a14', fontSize: 14, resize: 'none', outline: 'none', minHeight: 60, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {colors.map(c => (
            <div key={c} onClick={() => setBgColor(c)}
              style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: bgColor === c ? '3px solid #fff' : '2px solid transparent' }} />
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(10,10,20,0.65)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
          <span>📷</span> Subir imagen/video
          <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={handleCreate} disabled={loading || (!text.trim() && !file)}
            style={{ flex: 2, padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            {loading ? 'Publicando...' : 'Publicar Historia'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoriesBar() {
  const [groups, setGroups] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [creating, setCreating] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/ephemeral-stories/active`);
      setGroups(res.data.data || []);
    } catch (e) {
      // silenced;
    }
  };

  useEffect(() => { fetchStories(); }, []);

  const myGroup = groups.find(g => g.author._id === user?._id);

  return (
    <>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
        <AddStoryButton onAdd={() => setCreating(true)} />
        {myGroup && <StoryRing group={myGroup} isMine onOpen={setViewing} />}
        {groups.filter(g => g.author._id !== user?._id).map(g => (
          <StoryRing key={g.author._id} group={g} onOpen={setViewing} />
        ))}
      </div>

      {viewing && <StoryViewer group={viewing} onClose={() => { setViewing(null); fetchStories(); }} currentUser={user} />}
      {creating && <StoryCreator onClose={() => setCreating(false)} onCreated={fetchStories} />}
    </>
  );
}
