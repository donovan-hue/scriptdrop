const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const TwoFactorAuth = require('../models/TwoFactorAuth');
const crypto = require('crypto');

// Generate TOTP secret and QR code
exports.generateTOTPSecret = async (userId, email) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `KRONOS (${email})`,
      issuer: 'KRONOS',
      length: 32
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes: exports.generateBackupCodes()
    };
  } catch (error) {
    throw error;
  }
};

// Verify TOTP token
exports.verifyTOTPToken = (secret, token) => {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
    return verified;
  } catch (error) {
    return false;
  }
};

// Generate backup codes
exports.generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Verify backup code
exports.verifyBackupCode = async (userId, code) => {
  try {
    const twoFactor = await TwoFactorAuth.findOne({ userId });
    if (!twoFactor) return false;

    const codeIndex = twoFactor.backupCodes.indexOf(code);
    if (codeIndex === -1) return false;

    // Remove used code
    twoFactor.backupCodes.splice(codeIndex, 1);
    await twoFactor.save();

    return true;
  } catch (error) {
    return false;
  }
};

// Enable 2FA
exports.enableTwoFactor = async (userId, method, secret, backupCodes) => {
  try {
    let twoFactor = await TwoFactorAuth.findOne({ userId });
    
    if (!twoFactor) {
      twoFactor = new TwoFactorAuth({
        userId,
        method,
        secret,
        backupCodes,
        isEnabled: true
      });
    } else {
      twoFactor.method = method;
      twoFactor.secret = secret;
      twoFactor.backupCodes = backupCodes;
      twoFactor.isEnabled = true;
    }

    await twoFactor.save();
    return twoFactor;
  } catch (error) {
    throw error;
  }
};

// Disable 2FA
exports.disableTwoFactor = async (userId) => {
  try {
    await TwoFactorAuth.findOneAndUpdate(
      { userId },
      { isEnabled: false, secret: null, backupCodes: [] }
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// Add trusted device
exports.addTrustedDevice = async (userId, deviceId, deviceName, fingerprint) => {
  try {
    await TwoFactorAuth.findOneAndUpdate(
      { userId },
      {
        $push: {
          trustedDevices: {
            deviceId,
            deviceName,
            fingerprint,
            addedAt: new Date(),
            isActive: true
          }
        }
      }
    );
  } catch (error) {
    throw error;
  }
};

// Check if device is trusted
exports.isDeviceTrusted = async (userId, deviceId) => {
  try {
    const twoFactor = await TwoFactorAuth.findOne({ userId });
    if (!twoFactor) return false;

    const device = twoFactor.trustedDevices.find(
      d => d.deviceId === deviceId && d.isActive
    );

    if (device) {
      device.lastUsedAt = new Date();
      await twoFactor.save();
    }

    return !!device;
  } catch (error) {
    return false;
  }
};
