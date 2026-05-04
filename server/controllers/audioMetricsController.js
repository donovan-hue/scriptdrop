const AudioMetrics = require('../models/AudioMetrics');
const AudioSession = require('../models/AudioSession');
const AudioRoom = require('../models/AudioRoom');

const validateMetricsInput = (data) => {
  const errors = [];
  if (data.qualityScore !== undefined && (data.qualityScore < 0 || data.qualityScore > 100)) {
    errors.push('Quality score must be between 0 and 100');
  }
  if (data.audioMetrics) {
    if (data.audioMetrics.packetLoss !== undefined && (data.audioMetrics.packetLoss < 0 || data.audioMetrics.packetLoss > 100)) {
      errors.push('Packet loss must be between 0 and 100');
    }
    if (data.audioMetrics.latency !== undefined && data.audioMetrics.latency < 0) {
      errors.push('Latency cannot be negative');
    }
  }
  return errors;
};

exports.recordMetrics = async (req, res) => {
  try {
    const { sessionId, audioMetrics, connectionMetrics, systemMetrics, qualityScore } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const errors = validateMetricsInput(req.body);
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

    if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const metrics = new AudioMetrics({
      room: session.room,
      session: session._id,
      user: session.user,
      audioMetrics: {
        packetLoss: audioMetrics?.packetLoss || 0,
        latency: audioMetrics?.latency || 0,
        jitter: audioMetrics?.jitter || 0,
        audioLevel: audioMetrics?.audioLevel || 0,
        bandwidth: audioMetrics?.bandwidth || 0,
        frameRate: audioMetrics?.frameRate || 0,
        codecQuality: audioMetrics?.codecQuality || 100,
        averageLevel: audioMetrics?.averageLevel || 0
      },
      connectionMetrics: {
        packetLoss: connectionMetrics?.packetLoss || 0,
        latency: connectionMetrics?.latency || 0,
        jitter: connectionMetrics?.jitter || 0,
        bandwidth: connectionMetrics?.bandwidth || 0,
        signalStrength: connectionMetrics?.signalStrength || 0,
        connectionType: connectionMetrics?.connectionType || 'unknown'
      },
      systemMetrics: {
        cpuUsage: systemMetrics?.cpuUsage || 0,
        memoryUsage: systemMetrics?.memoryUsage || 0,
        temperature: systemMetrics?.temperature || 0,
        processRuntime: systemMetrics?.processRuntime || 0
      },
      qualityScore: Math.min(100, Math.max(0, qualityScore || 100)),
      timestamp: new Date()
    });

    await metrics.save();

    session.qualityMetrics = {
      ...session.qualityMetrics,
      packetLoss: audioMetrics?.packetLoss || session.qualityMetrics.packetLoss,
      latency: audioMetrics?.latency || session.qualityMetrics.latency,
      jitter: audioMetrics?.jitter || session.qualityMetrics.jitter,
      lastMetricUpdate: new Date()
    };
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Metrics recorded',
      data: {
        metricId: metrics._id,
        qualityScore: metrics.qualityScore,
        timestamp: metrics.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording metrics',
      error: error.message
    });
  }
};

exports.recordEvent = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { eventType, details } = req.body;

    if (!sessionId || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and event type are required'
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

    const metrics = new AudioMetrics({
      room: session.room,
      session: session._id,
      user: session.user,
      events: [{
        type: eventType,
        timestamp: new Date(),
        details: details || {},
        severity: details?.severity || 'info'
      }],
      eventOnly: true,
      timestamp: new Date()
    });

    await metrics.save();

    res.status(201).json({
      success: true,
      message: 'Event recorded',
      data: {
        eventId: metrics._id,
        eventType,
        timestamp: metrics.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording event',
      error: error.message
    });
  }
};

exports.getSessionMetrics = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

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

    const metrics = await AudioMetrics.find({ session: session._id })
      .sort('-timestamp')
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    if (metrics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No metrics found for this session',
        count: 0,
        averages: {
          qualityScore: 0,
          latency: 0,
          packetLoss: 0,
          jitter: 0
        },
        data: []
      });
    }

    const validMetrics = metrics.filter(m => !m.eventOnly && m.qualityScore !== undefined);

    const avgMetrics = {
      qualityScore: validMetrics.length > 0 ? (validMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / validMetrics.length).toFixed(2) : 0,
      latency: validMetrics.length > 0 ? (validMetrics.reduce((sum, m) => sum + (m.audioMetrics?.latency || 0), 0) / validMetrics.length).toFixed(2) : 0,
      packetLoss: validMetrics.length > 0 ? (validMetrics.reduce((sum, m) => sum + (m.audioMetrics?.packetLoss || 0), 0) / validMetrics.length).toFixed(2) : 0,
      jitter: validMetrics.length > 0 ? (validMetrics.reduce((sum, m) => sum + (m.audioMetrics?.jitter || 0), 0) / validMetrics.length).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      sessionId,
      count: metrics.length,
      averages: avgMetrics,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching session metrics',
      error: error.message
    });
  }
};

exports.getRoomMetrics = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate, limit = 1000 } = req.query;

    const room = await AudioRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    let query = { room: roomId, eventOnly: { $ne: true } };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start date format'
          });
        }
        query.timestamp.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end date format'
          });
        }
        query.timestamp.$lte = end;
      }
    }

    const metrics = await AudioMetrics.find(query)
      .sort('-timestamp')
      .limit(parseInt(limit));

    if (metrics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No metrics found',
        statistics: {
          totalRecords: 0,
          avgQualityScore: 0,
          avgLatency: 0,
          avgPacketLoss: 0,
          avgJitter: 0,
          periods: { excellent: 0, good: 0, fair: 0, poor: 0 }
        },
        dataPoints: 0,
        data: []
      });
    }

    const stats = {
      totalRecords: metrics.length,
      avgQualityScore: (metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length).toFixed(2),
      avgLatency: (metrics.reduce((sum, m) => sum + (m.audioMetrics?.latency || 0), 0) / metrics.length).toFixed(2),
      avgPacketLoss: (metrics.reduce((sum, m) => sum + (m.audioMetrics?.packetLoss || 0), 0) / metrics.length).toFixed(2),
      avgJitter: (metrics.reduce((sum, m) => sum + (m.audioMetrics?.jitter || 0), 0) / metrics.length).toFixed(2),
      minQuality: Math.min(...metrics.map(m => m.qualityScore)),
      maxQuality: Math.max(...metrics.map(m => m.qualityScore)),
      periods: {
        excellent: metrics.filter(m => m.qualityScore >= 90).length,
        good: metrics.filter(m => m.qualityScore >= 70 && m.qualityScore < 90).length,
        fair: metrics.filter(m => m.qualityScore >= 50 && m.qualityScore < 70).length,
        poor: metrics.filter(m => m.qualityScore < 50).length
      }
    };

    res.status(200).json({
      success: true,
      roomId,
      statistics: stats,
      dataPoints: metrics.length,
      data: metrics.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room metrics',
      error: error.message
    });
  }
};

exports.getUserMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const metrics = await AudioMetrics.find({
      user: userId,
      eventOnly: { $ne: true }
    })
      .populate('room', 'name theme')
      .sort('-timestamp')
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    if (metrics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No metrics found',
        statistics: {
          totalSessions: 0,
          totalRecords: 0,
          avgQualityScore: 0,
          recentAvg: 0,
          totalAudioTime: 0
        },
        data: []
      });
    }

    const uniqueSessions = new Set(metrics.map(m => m.session.toString()));

    const userStats = {
      totalSessions: uniqueSessions.size,
      avgQualityScore: (metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length).toFixed(2),
      totalRecords: metrics.length,
      recentAvg: (metrics.slice(0, 10).reduce((sum, m) => sum + m.qualityScore, 0) / Math.min(10, metrics.length)).toFixed(2),
      avgLatency: (metrics.reduce((sum, m) => sum + (m.audioMetrics?.latency || 0), 0) / metrics.length).toFixed(2),
      avgPacketLoss: (metrics.reduce((sum, m) => sum + (m.audioMetrics?.packetLoss || 0), 0) / metrics.length).toFixed(2)
    };

    res.status(200).json({
      success: true,
      userId,
      statistics: userStats,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user metrics',
      error: error.message
    });
  }
};

exports.getQualityTrend = async (req, res) => {
  try {
    const { roomId, sessionId, timeRange = '24h', granularity = '10m' } = req.query;

    if (!roomId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID or Session ID is required'
      });
    }

    const timeMs = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000
    }[timeRange] || 86400000;

    const granularityMs = {
      '1m': 60000,
      '5m': 300000,
      '10m': 600000,
      '30m': 1800000,
      '1h': 3600000
    }[granularity] || 600000;

    const startTime = new Date(Date.now() - timeMs);

    let query = {
      eventOnly: { $ne: true },
      timestamp: { $gte: startTime }
    };

    if (roomId) query.room = roomId;
    if (sessionId) {
      const session = await AudioSession.findOne({ sessionId });
      if (session) query.session = session._id;
    }

    const metrics = await AudioMetrics.find(query).sort('timestamp');

    if (metrics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No metrics found for trend analysis',
        timeRange,
        granularity,
        dataPoints: 0,
        data: []
      });
    }

    const intervals = {};
    metrics.forEach(metric => {
      const interval = Math.floor(metric.timestamp / granularityMs) * granularityMs;
      if (!intervals[interval]) {
        intervals[interval] = {
          scores: [],
          latencies: [],
          packetLosses: [],
          jitters: []
        };
      }
      intervals[interval].scores.push(metric.qualityScore);
      intervals[interval].latencies.push(metric.audioMetrics?.latency || 0);
      intervals[interval].packetLosses.push(metric.audioMetrics?.packetLoss || 0);
      intervals[interval].jitters.push(metric.audioMetrics?.jitter || 0);
    });

    const trend = Object.entries(intervals)
      .sort(([timeA], [timeB]) => parseInt(timeA) - parseInt(timeB))
      .map(([time, data]) => ({
        timestamp: new Date(parseInt(time)),
        avgQuality: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2),
        minQuality: Math.min(...data.scores),
        maxQuality: Math.max(...data.scores),
        avgLatency: (data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length).toFixed(2),
        avgPacketLoss: (data.packetLosses.reduce((a, b) => a + b, 0) / data.packetLosses.length).toFixed(2),
        avgJitter: (data.jitters.reduce((a, b) => a + b, 0) / data.jitters.length).toFixed(2),
        dataPoints: data.scores.length
      }));

    res.status(200).json({
      success: true,
      timeRange,
      granularity,
      dataPoints: trend.length,
      data: trend
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality trend',
      error: error.message
    });
  }
};

exports.getDetailedMetrics = async (req, res) => {
  try {
    const { sessionId } = req.params;

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

    const allMetrics = await AudioMetrics.find({ session: session._id }).sort('timestamp');

    if (allMetrics.length === 0) {
      return res.status(200).json({
        success: true,
        sessionId,
        message: 'No detailed metrics available',
        overview: {
          duration: session.duration || 0,
          status: session.status
        },
        data: []
      });
    }

    const overview = {
      duration: session.duration || 0,
      status: session.status,
      startTime: session.connectedAt,
      endTime: session.disconnectedAt,
      qualityScores: {
        min: Math.min(...allMetrics.map(m => m.qualityScore)),
        max: Math.max(...allMetrics.map(m => m.qualityScore)),
        avg: (allMetrics.reduce((s, m) => s + m.qualityScore, 0) / allMetrics.length).toFixed(2)
      },
      audioQuality: {
        avgLatency: (allMetrics.reduce((s, m) => s + (m.audioMetrics?.latency || 0), 0) / allMetrics.length).toFixed(2),
        avgPacketLoss: (allMetrics.reduce((s, m) => s + (m.audioMetrics?.packetLoss || 0), 0) / allMetrics.length).toFixed(2),
        avgJitter: (allMetrics.reduce((s, m) => s + (m.audioMetrics?.jitter || 0), 0) / allMetrics.length).toFixed(2),
        maxLatency: Math.max(...allMetrics.map(m => m.audioMetrics?.latency || 0)),
        maxPacketLoss: Math.max(...allMetrics.map(m => m.audioMetrics?.packetLoss || 0))
      }
    };

    res.status(200).json({
      success: true,
      sessionId,
      overview,
      recordCount: allMetrics.length,
      data: allMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching detailed metrics',
      error: error.message
    });
  }
};
