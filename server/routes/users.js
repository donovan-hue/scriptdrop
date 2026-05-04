const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateProfile,
  updateAvatar,
  getClothingHistory,
  getFoodOrderHistory,
  getUserStats
} = require('../controllers/userController');
const {
  blockUser,
  unblockUser,
  getBlockedUsers
} = require('../controllers/userBlockController');
const { uploadProfileImage } = require('../middleware/upload');
const User = require('../models/User');
const pushService = require('../services/pushService');

// Rutas de bloqueo (antes de /:userId para evitar conflictos de parametros)
router.get('/blocked', protect, getBlockedUsers);         // GET  /api/users/blocked
router.post('/:id/block', protect, blockUser);            // POST /api/users/:id/block
router.delete('/:id/block', protect, unblockUser);        // DELETE /api/users/:id/block

// Web Push subscription
router.get('/push-public-key', (req, res) => {
  res.json({ publicKey: pushService.getPublicKey() });
});

router.post('/push-subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ success: false, error: 'subscription.endpoint is required' });
    }
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: subscription });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/push-unsubscribe', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { pushSubscription: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/:userId', getUserProfile);
router.patch('/', protect, updateProfile);
router.post('/avatar', protect, uploadProfileImage.single('avatar'), updateAvatar);
router.get('/:userId/clothing-history', protect, getClothingHistory);
router.get('/:userId/food-history', protect, getFoodOrderHistory);
router.get('/:userId/stats', protect, getUserStats);

module.exports = router;
