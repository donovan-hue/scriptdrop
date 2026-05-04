const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createInteraction } = require('../controllers/analyticsController');

// Todas las rutas de interacciones requieren autenticacion
router.use(protect);

router.post('/', createInteraction);   // POST /api/interactions

module.exports = router;
