const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAttentionMetrics,
  createAttentionMetric,
  getInteractions,
  createInteraction
} = require('../controllers/analyticsController');

// Todas las rutas de analytics requieren autenticacion
router.use(protect);

router.get('/attention', getAttentionMetrics);      // GET  /api/analytics/attention
router.post('/attention', createAttentionMetric);   // POST /api/analytics/attention
router.get('/interactions', getInteractions);       // GET  /api/analytics/interactions

module.exports = router;
