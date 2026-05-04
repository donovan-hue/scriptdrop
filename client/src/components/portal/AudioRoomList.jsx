// Audio Room List Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import GlassCard from '../UI/GlassComponents';

const AudioRoomList = ({ onSelectRoom, onJoinRoom, loading }) => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('kronos-sci-fi');
  const [loadingRooms, setLoadingRooms] = useState(true);

  const themes = [
    { id: 'kronos-sci-fi', label: '🌀 Kronos Sci-fi', icon: '⚛️' },
    { id: 'cosmic', label: '🪐 Cosmic', icon: '🌌' },
    { id: 'nebula', label: '🌈 Nebula', icon: '✨' },
    { id: 'quantum', label: '🔬 Quantum', icon: '⚛️' },
    { id: 'portal', label: '🌪️ Portal', icon: '🌀' }
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchTerm, selectedTheme, rooms]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await axios.get('/api/audio/rooms', {
        params: { limit: 50, sort: '-createdAt' }
      });

      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (selectedTheme) {
      filtered = filtered.filter(r => r.theme === selectedTheme);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  };

  const themeIcon = {
    'kronos-sci-fi': '⚛️',
    'cosmic': '🌌',
    'nebula': '✨',
    'quantum': '⚛️',
    'portal': '🌀'
  };

  return (
    <motion.div
      className="audio-room-list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar */}
      <motion.div
        className="room-search-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-input-wrapper">
          <input
            type="text"
            placeholder="🔍 Buscar salas de audio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-search-input"
          />
          <span className="input-icon">🔊</span>
        </div>
      </motion.div>

      {/* Theme Filter */}
      <motion.div
        className="theme-filter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="filter-label">Temas:</p>
        <div className="theme-buttons">
          {themes.map((theme, idx) => (
            <motion.button
              key={theme.id}
              className={`theme-btn ${selectedTheme === theme.id ? 'active' : ''}`}
              onClick={() => setSelectedTheme(theme.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
            >
              <span>{theme.icon}</span>
              <span className="theme-label">{theme.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Rooms Grid */}
      {loadingRooms ? (
        <motion.div
          className="loading-state"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="loader"></div>
          <p>Cargando salas de audio...</p>
        </motion.div>
      ) : filteredRooms.length > 0 ? (
        <motion.div
          className="rooms-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredRooms.map((room, idx) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="room-card-wrapper"
            >
              <motion.div
                className="room-card glass-hover"
                onClick={() => onSelectRoom(room)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Card Header with Theme */}
                <div className="room-header">
                  <div className="room-theme-icon">
                    {themeIcon[room.theme] || '🎙️'}
                  </div>
                  <div className="room-status">
                    <span className="status-indicator">●</span>
                    <span className="active-users">{room.currentUsers}/{room.capacity}</span>
                  </div>
                </div>

                {/* Room Info */}
                <div className="room-info">
                  <h3 className="room-name">{room.name}</h3>
                  <p className="room-description">{room.description?.substring(0, 60)}...</p>

                  {/* Stats */}
                  <div className="room-stats">
                    <div className="stat">
                      <span>👥</span>
                      <span>{room.currentUsers}</span>
                    </div>
                    <div className="stat">
                      <span>🎛️</span>
                      <span>{room.audioFormat}</span>
                    </div>
                    <div className="stat">
                      <span>📊</span>
                      <span>{room.bitrate}k</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <motion.button
                  className="join-button glass-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinRoom(room);
                  }}
                  disabled={loading || room.currentUsers >= room.capacity}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? '⏳ Conectando...' : room.currentUsers >= room.capacity ? '❌ Llena' : '🎙️ Entrar'}
                </motion.button>

                {/* Theme Label */}
                <div className="room-theme-label">
                  {room.theme.replace('-', ' ').toUpperCase()}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-icon">🎙️</div>
          <h3>No hay salas disponibles</h3>
          <p>Intenta cambiar de tema o crea una nueva sala</p>
        </motion.div>
      )}

      {/* Stats Footer */}
      <motion.div
        className="list-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="stat-item">
          <span className="stat-icon">🌐</span>
          <span className="stat-text">Total de salas: {rooms.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👥</span>
          <span className="stat-text">Usuarios activos: {rooms.reduce((sum, r) => sum + r.currentUsers, 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📡</span>
          <span className="stat-text">Conexión: Excelente</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioRoomList;
