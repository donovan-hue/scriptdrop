const express = require('express');
const { protect: auth } = require('../middleware/auth');
const deliveryController = require('../controllers/deliveryController');

const router = express.Router();

// Predictions
router.post('/:orderId/predict', deliveryController.predictDelivery);
router.get('/:orderId/prediction', auth, deliveryController.getPrediction);

// Status updates
router.patch('/:orderId/status', auth, deliveryController.updateDeliveryStatus);

// Optimization
router.post('/:orderId/optimize-route', auth, deliveryController.optimizeRoute);

// Analytics
router.get('/analytics/summary', auth, deliveryController.getDeliveryAnalytics);

module.exports = router;
