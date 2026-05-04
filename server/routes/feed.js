const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getHybridFeed,
  getPersonalizedFeed,
  getTrendingNow
} = require('../controllers/feedController');

router.get('/hybrid', protect, getHybridFeed);
router.get('/personalized', protect, getPersonalizedFeed);
router.get('/trending', protect, getTrendingNow);

module.exports = router;
