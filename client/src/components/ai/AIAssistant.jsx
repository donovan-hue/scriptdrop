import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const TABS = [
  { id: 'chat', label: 'Chat IA', icon: '🤖' },
  { id: 'caption', label: 'Caption', icon: '✍️' },
  { id: 'image', label: 'Imagen', icon: '🎨' },
  { id: 'hashtags', label: 'Hashtags', icon: '#️⃣' }
];

export default function AIAssistant({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hola! Soy KRONOS AI. Te ayudo a crear contenido, generar imagenes y mucho mas. ¿Que necesitas?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [captionStyle, setCaptionStyle] = useState('casual');
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setChatMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/ai/chat`, {
        messages: [...chatMessages, userMsg].filter(m => m.role !== 'system')
      }, { headers });
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con la IA. Verifica que OPENAI_API_KEY este configurado.' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateCaption = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const { data } = await axios.post(`${API}/ai/caption`, { prompt: input, style: captionStyle }, { headers });
      setResult(data.caption);
    } catch (err) {
      setResult(err.response?.data?.message || 'Error generando caption');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setImageUrl('');
    try {
      const { data } = await axios.post(`${API}/ai/image`, { prompt: input }, { headers });
      setImageUrl(data.imageUrl);
    } catch (err) {
      setResult(err.response?.data?.message || 'Error generando imagen');
    } finally {
      setLoading(false);
    }
  };

  const generateHashtags = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const { data } = await axios.post(`${API}/ai/hashtags`, { content: input, count: 10 }, { headers });
      setResult(data.hashtags.join(' '));
    } catch (err) {
      setResult(err.response?.data?.message || 'Error generando hashtags');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (activeTab === 'chat') sendChat();
    else if (activeTab === 'caption') generateCaption();
    else if (activeTab === 'image') generateImage();
    else if (activeTab === 'hashtags') generateHashtags();
  };

  const placeholders = {
    chat: 'Preguntame algo...',
    caption: 'Describe tu publicacion...',
    image: 'Describe la imagen que quieres crear...',
    hashtags: 'Describe tu contenido...'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-lg h-[600px] bg-[#0a0a14] border border-purple-500/20 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-sm">🤖</div>
                <span className="text-white font-bold">KRONOS AI</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">Beta</span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-white/5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResult(''); setImageUrl(''); setInput(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'bg-purple-500/30 text-purple-300' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'chat' ? (
                <div className="space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-purple-500/30 text-purple-100 rounded-br-sm'
                          : 'bg-white/5 text-white/80 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2.5 bg-white/5 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTab === 'caption' && (
                    <div className="flex gap-2 flex-wrap">
                      {['casual', 'professional', 'funny', 'poetic', 'viral'].map(style => (
                        <button
                          key={style}
                          onClick={() => setCaptionStyle(style)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${
                            captionStyle === style ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/10 text-white/40'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}

                  {result && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white/40 text-xs">Resultado</span>
                        <button onClick={() => navigator.clipboard.writeText(result)} className="text-purple-400 text-xs hover:text-purple-300">
                          Copiar
                        </button>
                      </div>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{result}</p>
                    </div>
                  )}

                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <img src={imageUrl} alt="AI Generated" className="w-full" />
                      <div className="p-2 flex justify-end">
                        <a href={imageUrl} target="_blank" rel="noreferrer" className="text-purple-400 text-xs hover:text-purple-300">
                          Abrir original
                        </a>
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-white/40 text-sm">
                        {activeTab === 'image' ? 'Generando imagen (puede tardar 15-30s)...' : 'Generando...'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAction()}
                  placeholder={placeholders[activeTab]}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder-white/20"
                />
                <button
                  onClick={handleAction}
                  disabled={loading || !input.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
                >
                  {loading ? '...' : '→'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
