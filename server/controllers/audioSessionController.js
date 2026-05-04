const AudioSession = require('../models/AudioSession');
const AudioRoom = require('../models/AudioRoom');
const AudioMetrics = require('../models/AudioMetrics');
const crypto = require('crypto');

const validateSessionInput = (data) => {
  const errors = [];
  if (data.audioLevel !== undefined && (data.audioLevel < 0 || data.audioLevel > 100)) {
    errors.push('Audio level must be between 0 and 100');
  }
  if (data.x !== undefined || data.y !== undefined || data.z !== undefined) {
    if ((data.x && isNaN(data.x)) || (data.y && isNaN(data.y)) || (data.z && isNaN(data.z))) {
      errors.push('Spatial coordinates must be valid numbers');
    }
  }
  return errors;
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    const room = await AudioRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.currentUsers >= room.capacity) {
      return res.status(403).json({
        success: false,
        message: 'Room is full'
      });
    }

    const existingSession = await AudioSession.findOne({
      room: roomId,
      user: req.user.id,
      status: { $in: ['connecting', 'connected', 'active'] }
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Already connected to this room'
      });
    }

    const sessionId = `${roomId}-${req.user.id}-${crypto.randomBytes(8).toString('hex')}`;

    const session = new AudioSession({
      room: roomId,
      user: req.user.id,
      sessionId,
      status: 'connecting',
      connectedAt: new Date(),
      username: req.user.username,
      avatar: req.user.avatar,
      audioLevel: 75,
      isMuted: false,
      microphoneEnabled: true,
      speakerEnabled: true,
      spatial: { x: 0, y: 0, z: 0 },
      qualityMetrics: {
        packetLoss: 0,
        latency: 0,
        jitter: 0,
        audioQuality: 100
      }
    });

    await session.save();

    room.currentUsers += 1;
    if (room.currentUsers > room.peakUsers) {
      room.peakUsers = room.currentUsers;
    }
    room.totalSessions = (room.totalSessions || 0) + 1;
    await room.save();

    await session.populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Joined room successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining room',
      error: error.message
    });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await AudioSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (session.status === 'disconnected') {
      return res.status(400).json({
        success: false,
        message: 'Session already disconnected'
      });
    }

    const duration = Math.floor((new Date() - session.connectedAt) / 1000);

    session.status = 'disconnected';
    session.disconnectedAt = new Date();
    session.duration = duration;
    session.qualityMetrics.sessionDuration = duration;
    await session.save();

    const room = await AudioRoom.findById(session.room);
    if (room) {
      room.currentUsers = Math.max(0, room.currentUsers - 1);

      const allSessions = await AudioSession.find({ room: session.room, duration: { $exists: true } });
      if (allSessions.length > 0) {
        const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        room.averageDuration = Math.floor(totalDuration / allSessions.length);
      }

      await room.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left room successfully',
      data: {
        sessionDuration: duration,
        sessionId: session.sessionId,
        qualityMetrics: session.qualityMetrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving room',
      error: error.message
    });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await AudioSession.findOne({ sessionId: req.params.sessionId })
      .populate('user', 'username avatar')
      .populate('room', 'name theme');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: error.message
    });
  }
};

exports.updateAudioLevel = async (req, res) => {
  try {
    const { audioLevel, microphoneEnabled, speakerEnabled } = req.body;
    const sessionId = req.params.sessionId;

    const errors = validateSessionInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    const session = await AudioSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (audioLevel !== undefined) {
      session.audioLevel = Math.max(0, Math.min(100, audioLevel));
      session.qualityMetrics.audioQuality = Math.floor(audioLevel);
    }
    if (microphoneEnabled !== undefined) session.microphoneEnabled = microphoneEnabled;
    if (speakerEnabled !== undefined) session.speakerEnabled = speakerEnabled;

    session.lastUpdate = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Audio settings updated',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating audio',
      error: error.message
    });
  }
};

exports.updateSpatialPosition = async (req, res) => {
  try {
    const { x, y, z } = req.body;
    const sessionId = req.params.sessionId;

    const errors = validateSessionInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    const session = await AudioSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    session.spatial = {
      x: parseFloat(x) || 0,
      y: parseFloat(y) || 0,
      z: parseFloat(z) || 0,
      lastUpdated: new Date()
    };

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Spatial position updated',
      data: {
        sessionId: session.sessionId,
        spatial: session.spatial
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating position',
      error: error.message
    });
  }
};

exports.toggleMute = async (req, res) => {
  try {
    const { isMuted } = req.body;
    const session = await AudioSession.findOne({ sessionId: req.params.sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    session.isMuted = isMuted !== undefined ? isMuted : !session.isMuted;
    session.lastUpdate = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: `${session.isMuted ? 'Muted' : 'Unmuted'}`,
      data: {
        sessionId: session.sessionId,
        isMuted: session.isMuted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling mute',
      error: error.message
    });
  }
};

exports.getRoomSessions = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { includeInactive } = req.query;

    const query = {
      room: roomId,
      ...(includeInactive !== 'true' && { status: { $in: ['connecting', 'connected', 'active'] } })
    };

    const sessions = await AudioSession.find(query)
      .populate('user', 'username avatar')
      .sort('-connectedAt');

    const sessionStats = {
      active: sessions.filter(s => s.status === 'active').length,
      connecting: sessions.filter(s => s.status === 'connecting').length,
      connected: sessions.filter(s => s.status === 'connected').length
    };

    res.status(200).json({
      success: true,
      count: sessions.length,
      statistics: sessionStats,
      data: sessions.map(s => ({
        sessionId: s.sessionId,
        userId: s.user._id,
        username: s.user.username,
        avatar: s.user.avatar,
        status: s.status,
        connectedAt: s.connectedAt,
        audioLevel: s.audioLevel,
        isMuted: s.isMuted,
        spatial: s.spatial,
        qualityMetrics: s.qualityMetrics
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
};

exports.updateQualityMetrics = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { packetLoss, latency, jitter, audioQuality } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await AudioSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    session.qualityMetrics = {
      ...session.qualityMetrics,
      packetLoss: packetLoss !== undefined ? Math.min(100, Math.max(0, packetLoss)) : session.qualityMetrics.packetLoss,
      latency: latency !== undefined ? Math.max(0, latency) : session.qualityMetrics.latency,
      jitter: jitter !== undefined ? Math.max(0, jitter) : session.qualityMetrics.jitter,
      audioQuality: audioQuality !== undefined ? Math.min(100, Math.max(0, audioQuality)) : session.qualityMetrics.audioQuality,
      lastMetricUpdate: new Date()
    };

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Quality metrics updated',
      data: session.qualityMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quality metrics',
      error: error.message
    });
  }
};
