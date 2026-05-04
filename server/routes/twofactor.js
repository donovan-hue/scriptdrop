const express = require('express');
const { protect: auth } = require('../middleware/auth');
const twoFactorController = require('../controllers/twoFactorController');

const router = express.Router();

// Setup 2FA
router.post('/setup-totp', auth, twoFactorController.setupTOTP);
router.post('/verify-totp', auth, twoFactorController.verifyAndEnableTOTP);
router.post('/verify', twoFactorController.verifyTwoFactor);

// Disable 2FA
router.post('/disable', auth, twoFactorController.disableTwoFactor);

// Backup codes
router.post('/regenerate-codes', auth, twoFactorController.regenerateBackupCodes);

// Session management
router.get('/sessions', auth, twoFactorController.getActiveSessions);
router.post('/sessions/:sessionId/logout', auth, twoFactorController.logoutSession);
router.post('/sessions/logout-all', auth, twoFactorController.logoutAllDevices);

module.exports = router;
