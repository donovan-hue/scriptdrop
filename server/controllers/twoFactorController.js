const TwoFactorAuth = require('../models/TwoFactorAuth');
const ActiveSession = require('../models/ActiveSession');
const twoFactorService = require('../services/twoFactorService');
const { queueEmail } = require('../services/emailService');

// Setup TOTP
exports.setupTOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { secret, qrCode, backupCodes } = await twoFactorService.generateTOTPSecret(
      userId,
      req.user.email
    );

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        backupCodes
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Verify and enable TOTP
exports.verifyAndEnableTOTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { secret, token, backupCodes } = req.body;

    const isValid = twoFactorService.verifyTOTPToken(secret, token);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    await twoFactorService.enableTwoFactor(userId, 'totp', secret, backupCodes);

    await queueEmail(req.user.email, 'verification', {
      name: req.user.username,
      verificationLink: 'https://app.kronos.com/security/2fa'
    });

    res.json({ success: true, message: '2FA enabled' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Verify 2FA during login
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { userId, token, isBackupCode, trustDevice, deviceId, deviceName } = req.body;

    const twoFactor = await TwoFactorAuth.findOne({ userId });
    if (!twoFactor || !twoFactor.isEnabled) {
      return res.status(400).json({ success: false, error: '2FA not enabled' });
    }

    let isValid = false;

    if (isBackupCode) {
      isValid = await twoFactorService.verifyBackupCode(userId, token);
    } else {
      isValid = twoFactorService.verifyTOTPToken(twoFactor.secret, token);
    }

    if (!isValid) {
      twoFactor.failedAttempts += 1;
      if (twoFactor.failedAttempts >= 5) {
        twoFactor.isLocked = true;
        twoFactor.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await twoFactor.save();
      return res.status(400).json({ success: false, error: 'Invalid code' });
    }

    twoFactor.failedAttempts = 0;
    twoFactor.lastUsed = new Date();

    if (trustDevice && deviceId) {
      await twoFactorService.addTrustedDevice(userId, deviceId, deviceName, '');
    }

    await twoFactor.save();

    res.json({ success: true, message: '2FA verified' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get active sessions
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await ActiveSession.find({
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Logout from specific session
exports.logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ActiveSession.findByIdAndUpdate(sessionId, {
      isActive: false,
      logoutAt: new Date()
    });

    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Logout from all devices
exports.logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    await ActiveSession.updateMany(
      { userId, isActive: true },
      { isActive: false, logoutAt: new Date() }
    );

    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Disable 2FA
exports.disableTwoFactor = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password first
    const user = await require('../models/User').findById(req.user.id);
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Invalid password' });
    }

    await twoFactorService.disableTwoFactor(req.user.id);

    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Regenerate backup codes
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const newCodes = twoFactorService.generateBackupCodes();

    await TwoFactorAuth.findOneAndUpdate(
      { userId: req.user.id },
      { backupCodes: newCodes }
    );

    res.json({ success: true, data: { backupCodes: newCodes } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
