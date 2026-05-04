const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSessions,
  deleteSession,
  deleteAllSessions
} = require('../controllers/sessionController');

// Todas las rutas de sesiones requieren autenticacion
router.use(protect);

router.get('/', getSessions);                  // GET  /api/sessions
router.delete('/all', deleteAllSessions);      // DELETE /api/sessions/all
router.delete('/:id', deleteSession);          // DELETE /api/sessions/:id

module.exports = router;
