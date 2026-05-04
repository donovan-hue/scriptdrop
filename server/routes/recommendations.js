const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const {
  getRecommendedPosts,
  getRecommendedUsers,
  getTrending,
  trackInteraction,
  getUserProfile
} = require('../controllers/recommendationController');

router.get('/posts', auth, getRecommendedPosts);
router.get('/users', auth, getRecommendedUsers);
router.get('/trending', getTrending);
router.post('/track', auth, trackInteraction);
router.get('/profile', auth, getUserProfile);

module.exports = router;
