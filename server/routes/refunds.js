const express = require('express');
const { protect } = require('../middleware/auth');
const refundController = require('../controllers/refundController');

const router = express.Router();

// ── Usuario ────────────────────────────────────────────────────────────────
// POST /api/refunds/request  →  solicitar reembolso
router.post('/request', protect, refundController.requestRefund);

// GET  /api/refunds/my       →  ver mis reembolsos (con populate de la orden)
router.get('/my', protect, refundController.getMyRefunds);

// GET  /api/refunds/all      →  solo admin: listar todos los reembolsos
router.get('/all', protect, refundController.getAllRefunds);

// GET  /api/refunds/:id      →  detalle de un reembolso (propio o admin)
router.get('/:id', protect, refundController.getRefundStatus);

// ── Admin ──────────────────────────────────────────────────────────────────
// PATCH /api/refunds/:id/approve  →  aprobar y ejecutar refund en Stripe
router.patch('/:id/approve', protect, refundController.approveRefund);

// PATCH /api/refunds/:id/reject   →  rechazar con razón
router.patch('/:id/reject', protect, refundController.rejectRefund);

// Ruta legacy (mantiene compatibilidad)
router.patch('/:refundId/process', protect, refundController.processRefund);

module.exports = router;
