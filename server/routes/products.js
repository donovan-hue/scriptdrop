const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  addReview,
  createCheckoutSession
} = require('../controllers/productController');

router.post('/', protect, checkRole(['seller', 'admin']), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.patch('/:id', protect, checkRole(['seller', 'admin']), updateProduct);
router.post('/:id/review', protect, addReview);
router.post('/checkout/session', protect, createCheckoutSession);

module.exports = router;
