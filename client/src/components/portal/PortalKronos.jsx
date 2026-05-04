// Portal Kronos - Main Audio Room Component
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudioRoom } from '../../hooks/useAudioRoom';
import { useSpatialAudio } from '../../hooks/useSpatialAudio';
import AudioRoomList from './AudioRoomList';
import AudioRoom from './AudioRoom';
import PortalAnimation from './PortalAnimation';
import './portal-kronos.css';

const PortalKronos = () => {
  const [view, setView] = useState('list'); // 'list' or 'room'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const { joinRoom, leaveRoom, currentSession } = useAudioRoom();
  const { initAudio, stopAudio } = useSpatialAudio();

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleJoinRoom = async (room) => {
    setLoading(true);
    try {
      // Initialize audio
      await initAudio();

      // Join room
      const session = await joinRoom(room._id);

      if (session) {
        setSelectedRoom(room);
        setView('room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      stopAudio();
      setView('list');
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  return (
    <motion.div
      className="portal-kronos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Portal Background Effect */}
      <div className="portal-background">
        <div className="portal-grid">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="grid-line"
              animate={{
                opacity: [0.1, 0.3, 0.1],
                y: [0, 10, 0]
              }}
              transition={{
                duration: 4,
                delay: i * 0.1,
                repeat: Infinity
              }}
            />
          ))}
        </div>
        <div className="portal-particles">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                x: Math.cos((i / 50) * Math.PI * 2) * 200,
                y: Math.sin((i / 50) * Math.PI * 2) * 200,
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="portal-content">
        {/* Header */}
        <motion.div
          className="portal-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="header-title">
            <h1>🌀 PORTAL KRONOS</h1>
            <p className="subtitle">Salas de Audio Espacial 3D Sci-fi</p>
          </div>
          
          {currentSession && (
            <motion.div
              className="session-info"
              animate={{ 
                boxShadow: ['0 0 20px rgba(0, 255, 136, 0.3)', '0 0 40px rgba(0, 255, 136, 0.6)', '0 0 20px rgba(0, 255, 136, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="status-dot">●</span>
              <span>En vivo en: {selectedRoom?.name}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content */}
        {view === 'list' ? (
          <AudioRoomList
            onSelectRoom={handleSelectRoom}
            onJoinRoom={handleJoinRoom}
            loading={loading}
          />
        ) : (
          <AudioRoom
            room={selectedRoom}
            session={currentSession}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {/* Portal Animation Effect */}
        {view === 'room' && (
          <PortalAnimation
            theme={selectedRoom?.theme}
            isActive={view === 'room'}
          />
        )}
      </div>

      {/* Glow Border Effect */}
      <div className="portal-border">
        <div className="border-glow"></div>
      </div>
    </motion.div>
  );
};

export default PortalKronos;
