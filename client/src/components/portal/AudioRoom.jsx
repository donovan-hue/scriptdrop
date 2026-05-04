// Audio Room Active Interface Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import SpatialAudioEffect from '../effects/SpatialAudioEffect';
import './portal-kronos.css';

const AudioRoom = ({ room, session, onLeaveRoom }) => {
  const [audioLevel, setAudioLevel] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isDeafened, setIsDeafened] = useState(false);

  useEffect(() => {
    // Fetch active users in room
    fetchActiveUsers();

    // Simulate real-time updates
    const interval = setInterval(fetchActiveUsers, 2000);

    return () => clearInterval(interval);
  }, [room?._id]);

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch(`/api/audio/rooms/${room?._id}/sessions`);
      const data = await response.json();
      if (data.success) {
        setActiveUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <motion.div
      className="audio-room-active"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Visualizer Background */}
      <div className="visualizer-container">
        <AudioVisualizer theme={room?.visualEffect} intensity={audioLevel / 100} />
      </div>

      {/* Main Control Panel */}
      <motion.div
        className="control-panel glass-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Room Info */}
        <div className="panel-header">
          <h2 className="room-title">
            🌀 {room?.name}
          </h2>
          <p className="room-subtitle">{room?.theme.replace('-', ' ').toUpperCase()}</p>
        </div>

        {/* Audio Controls */}
        <div className="audio-controls">
          {/* Volume Control */}
          <motion.div
            className="control-group"
            whileHover={{ scale: 1.05 }}
          >
            <label className="control-label">🔊 Volumen</label>
            <div className="volume-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={audioLevel}
                onChange={(e) => setAudioLevel(parseInt(e.target.value))}
                className="slider"
              />
              <span className="volume-value">{audioLevel}%</span>
            </div>
          </motion.div>

          {/* Microphone Controls */}
          <div className="control-row">
            {/* Microphone Button */}
            <motion.button
              className={`control-btn ${!isMicEnabled ? 'inactive' : ''}`}
              onClick={() => setIsMicEnabled(!isMicEnabled)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="icon">{isMicEnabled ? '🎙️' : '🔇'}</span>
              <span>{isMicEnabled ? 'Micrófono' : 'Silenciado'}</span>
            </motion.button>

            {/* Mute Button */}
            <motion.button
              className={`control-btn ${isMuted ? 'active' : ''}`}
              onClick={() => setIsMuted(!isMuted)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="icon">{isMuted ? '🤐' : '🔊'}</span>
              <span>{isMuted ? 'Muted' : 'Active'}</span>
            </motion.button>

            {/* Deafen Button */}
            <motion.button
              className={`control-btn ${isDeafened ? 'inactive' : ''}`}
              onClick={() => setIsDeafened(!isDeafened)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="icon">{isDeafened ? '🚫' : '👂'}</span>
              <span>{isDeafened ? 'Sordo' : 'Escuchando'}</span>
            </motion.button>
          </div>

          {/* Leave Button */}
          <motion.button
            className="leave-btn glass-btn"
            onClick={onLeaveRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ❌ Salir de la Sala
          </motion.button>
        </div>
      </motion.div>

      {/* Active Users Panel */}
      <motion.div
        className="users-panel glass-card"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3 className="panel-title">👥 Usuarios en Línea</h3>

        {activeUsers.length > 0 ? (
          <motion.div className="users-list">
            {activeUsers.map((user, idx) => (
              <motion.div
                key={user._id}
                className="user-item glass-card-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 5 }}
              >
                {/* User Avatar */}
                <div className="user-avatar" style={{ color: user.color }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div className="user-info">
                  <p className="user-name">{user.username}</p>
                  <p className="user-status">
                    {user.isMuted ? '🤐 Muted' : '🎤 Active'}
                  </p>
                </div>

                {/* Spatial Position */}
                <div className="spatial-indicator">
                  <div className="position-dot" style={{
                    left: `${(user.spatial?.x || 0) + 50}%`,
                    top: `${(user.spatial?.y || 0) + 50}%`
                  }}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="no-users">
            <p>Eres el único en la sala</p>
          </motion.div>
        )}

        <div className="users-stats">
          <span>📊 Total: {activeUsers.length}/ {room?.capacity}</span>
        </div>
      </motion.div>

      {/* Spatial Audio Effect Background */}
      {room?.audioFormat === 'spatial-3d' && (
        <SpatialAudioEffect users={activeUsers} />
      )}

      {/* Room Stats */}
      <motion.div
        className="room-stats-panel glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="stat-row">
          <span className="stat-icon">📡</span>
          <span className="stat-label">Formato</span>
          <span className="stat-value">{room?.audioFormat}</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🎛️</span>
          <span className="stat-label">Bitrate</span>
          <span className="stat-value">{room?.bitrate} kbps</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🎨</span>
          <span className="stat-label">Efecto</span>
          <span className="stat-value">{room?.visualEffect}</span>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🌍</span>
          <span className="stat-label">Latencia</span>
          <span className="stat-value">12ms</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioRoom;
