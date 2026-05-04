const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  processPayment,
  trackOrder,
  rateOrder
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/restaurant-orders', protect, checkRole(['seller', 'admin']), getRestaurantOrders);
router.patch('/:orderId/status', protect, updateOrderStatus);
router.post('/:orderId/payment', protect, processPayment);
router.get('/:orderId/track', trackOrder);
router.post('/:orderId/rate', protect, rateOrder);

module.exports = router;
