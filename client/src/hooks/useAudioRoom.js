// useAudioRoom Hook - Portal Kronos
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

let socket = null;

export const useAudioRoom = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!socket) {
      socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socket.on('user_joined_audio', (data) => {
        console.log('User joined:', data);
        // Refetch users
      });

      socket.on('user_left_audio', (data) => {
        console.log('User left:', data);
      });

      socket.on('user_mute_changed', (data) => {
        console.log('Mute status changed:', data);
      });

      socket.on('spatial_position_updated', (data) => {
        console.log('Position updated:', data);
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('✓ Connected to audio server');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('✗ Disconnected from audio server');
      });

      socket.on('connect_error', (error) => {
        setError(error.message);
        console.error('Connection error:', error);
      });
    }

    return () => {
      // Clean up on unmount
      if (socket && socket.disconnect) {
        socket.disconnect();
      }
    };
  }, []);

  // Join audio room
  const joinRoom = useCallback(
    async (roomId) => {
      try {
        setError(null);

        // Call API to join room
        const response = await axios.post('/api/audio/sessions/join', { roomId });

        if (response.data.success) {
          const session = response.data.data;
          setCurrentSession(session);

          // Emit socket event
          socket?.emit('join_audio_room', {
            roomId,
            userId: session.user._id || session.user,
            username: session.username,
            sessionId: session.sessionId
          });

          return session;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        console.error('Error joining room:', err);
        throw err;
      }
    },
    []
  );

  // Leave audio room
  const leaveRoom = useCallback(async () => {
    try {
      if (!currentSession) return;

      // Emit socket event
      socket?.emit('leave_audio_room', {
        roomId: currentSession.room,
        userId: currentSession.user,
        username: currentSession.username
      });

      // Call API to leave room
      const response = await axios.post('/api/audio/sessions/leave', {
        sessionId: currentSession.sessionId
      });

      if (response.data.success) {
        setCurrentSession(null);
        setRoomUsers([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      console.error('Error leaving room:', err);
      throw err;
    }
  }, [currentSession]);

  // Update audio level
  const updateAudioLevel = useCallback(
    async (audioLevel) => {
      try {
        if (!currentSession) return;

        const response = await axios.put(
          `/api/audio/sessions/${currentSession.sessionId}/audio`,
          { audioLevel }
        );

        if (response.data.success) {
          setCurrentSession(response.data.data);
        }
      } catch (err) {
        console.error('Error updating audio level:', err);
        throw err;
      }
    },
    [currentSession]
  );

  // Update spatial position
  const updateSpatialPosition = useCallback(
    async (spatial) => {
      try {
        if (!currentSession) return;

        const response = await axios.put(
          `/api/audio/sessions/${currentSession.sessionId}/spatial`,
          spatial
        );

        if (response.data.success) {
          // Emit socket event for real-time update
          socket?.emit('update_spatial_position', {
            roomId: currentSession.room,
            userId: currentSession.user,
            spatial
          });
        }
      } catch (err) {
        console.error('Error updating spatial position:', err);
        throw err;
      }
    },
    [currentSession]
  );

  // Toggle mute
  const toggleMute = useCallback(
    async (isMuted) => {
      try {
        if (!currentSession) return;

        const response = await axios.put(
          `/api/audio/sessions/${currentSession.sessionId}/mute`,
          { isMuted }
        );

        if (response.data.success) {
          setCurrentSession(response.data.data);

          // Emit socket event
          socket?.emit('toggle_audio_mute', {
            roomId: currentSession.room,
            userId: currentSession.user,
            isMuted
          });
        }
      } catch (err) {
        console.error('Error toggling mute:', err);
        throw err;
      }
    },
    [currentSession]
  );

  // Record metrics
  const recordMetrics = useCallback(
    async (metrics) => {
      try {
        if (!currentSession) return;

        await axios.post('/api/audio/metrics', {
          sessionId: currentSession.sessionId,
          ...metrics
        });
      } catch (err) {
        console.error('Error recording metrics:', err);
      }
    },
    [currentSession]
  );

  return {
    currentSession,
    roomUsers,
    isConnected,
    error,
    joinRoom,
    leaveRoom,
    updateAudioLevel,
    updateSpatialPosition,
    toggleMute,
    recordMetrics,
    socket
  };
};
