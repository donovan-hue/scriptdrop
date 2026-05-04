// Audio Routes - Portal Kronos
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const audioRoomController = require('../controllers/audioRoomController');
const audioSessionController = require('../controllers/audioSessionController');
const audioMetricsController = require('../controllers/audioMetricsController');

// ========================
// AUDIO ROOM ROUTES
// ========================

// Public routes
router.get('/rooms', audioRoomController.getAllRooms);
router.get('/rooms/theme/:theme', audioRoomController.getRoomsByTheme);
router.get('/rooms/:id', audioRoomController.getRoom);

// Protected routes
router.post('/rooms', protect, audioRoomController.createRoom);
router.put('/rooms/:id', protect, audioRoomController.updateRoom);
router.delete('/rooms/:id', protect, audioRoomController.deleteRoom);
router.get('/user/my-rooms', protect, audioRoomController.getUserRooms);
router.get('/rooms/:id/stats', protect, audioRoomController.getRoomStats);

// ========================
// AUDIO SESSION ROUTES
// ========================

// Join/Leave
router.post('/sessions/join', protect, audioSessionController.joinRoom);
router.post('/sessions/leave', protect, audioSessionController.leaveRoom);

// Session management
router.get('/sessions/:sessionId', protect, audioSessionController.getSession);
router.put('/sessions/:sessionId/audio', protect, audioSessionController.updateAudioLevel);
router.put('/sessions/:sessionId/spatial', protect, audioSessionController.updateSpatialPosition);
router.put('/sessions/:sessionId/mute', protect, audioSessionController.toggleMute);

// Get room sessions
router.get('/rooms/:roomId/sessions', audioSessionController.getRoomSessions);

// ========================
// AUDIO METRICS ROUTES
// ========================

// Record metrics
router.post('/metrics', protect, audioMetricsController.recordMetrics);
router.post('/metrics/:sessionId/event', protect, audioMetricsController.recordEvent);

// Get metrics
router.get('/metrics/session/:sessionId', protect, audioMetricsController.getSessionMetrics);
router.get('/metrics/room/:roomId', protect, audioMetricsController.getRoomMetrics);
router.get('/metrics/user/stats', protect, audioMetricsController.getUserMetrics);
router.get('/metrics/trend/quality', protect, audioMetricsController.getQualityTrend);

module.exports = router;
