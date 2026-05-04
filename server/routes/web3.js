const express = require('express');
const router = express.Router();
const web3Controller = require('../controllers/web3Controller');
const {
  web3Protect,
  verifyWalletSignature,
  checkWalletExists,
  validateWalletAddress
} = require('../middleware/web3Auth');

// Public routes

/**
 * POST /api/web3/login/initialize
 * Initialize Web3 login - Get nonce for signature challenge
 * Body: { walletAddress }
 * Returns: { nonce, message, expiresIn }
 */
router.post('/login/initialize', validateWalletAddress, web3Controller.initializeLogin);

/**
 * POST /api/web3/login/verify
 * Verify signature and create session
 * Body: { walletAddress, signature, nonce }
 * Returns: { token, user }
 */
router.post('/login/verify', validateWalletAddress, web3Controller.verifySignature);

/**
 * POST /api/web3/login
 * Login with wallet (after verification)
 * Body: { walletAddress }
 * Returns: { token, user }
 */
router.post('/login', validateWalletAddress, web3Controller.loginWithWallet);

// Protected routes (require Web3 authentication)

/**
 * GET /api/web3/profile
 * Get authenticated user's wallet profile
 * Headers: Authorization: Bearer <token>
 * Returns: { user wallet data }
 */
router.get('/profile', web3Protect, web3Controller.getUserWallet);

/**
 * POST /api/web3/update-balance
 * Update wallet balance and network information
 * Headers: Authorization: Bearer <token>
 * Body: { balance, chainId, networkName }
 * Returns: { updated user }
 */
router.post('/update-balance', web3Protect, web3Controller.updateWalletBalance);

/**
 * POST /api/web3/update-ens
 * Update ENS name for wallet
 * Headers: Authorization: Bearer <token>
 * Body: { ens }
 * Returns: { updated user }
 */
router.post('/update-ens', web3Protect, web3Controller.updateENS);

/**
 * POST /api/web3/logout
 * Logout user (invalidate token)
 * Headers: Authorization: Bearer <token>
 * Returns: { success message }
 */
router.post('/logout', web3Protect, web3Controller.logout);

module.exports = router;
