const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { protect } = require('../middleware/auth');

// Initialize wallet
router.post('/wallet/init', protect, tokenController.initializeWallet);

// Get balance
router.get('/balance', protect, tokenController.getBalance);

// Transfer tokens
router.post('/transfer', protect, tokenController.transferTokens);

// Staking
router.post('/stake', protect, tokenController.stakeTokens);
router.get('/stakes', protect, tokenController.getStakes);
router.post('/claim-rewards', protect, tokenController.claimRewards);

// Attention tracking
router.post('/track-attention', protect, tokenController.trackAttention);
router.get('/attention-metrics', protect, tokenController.getAttentionMetrics);

// Creator earnings
router.get('/creator-earnings', protect, tokenController.getCreatorEarnings);

// Leaderboard
router.get('/leaderboard', tokenController.getLeaderboard);

// Transactions
router.get('/transactions', protect, tokenController.getTransactions);

// Token info
router.get('/info', tokenController.getTokenInfo);

module.exports = router;
