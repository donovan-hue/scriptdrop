const mongoose = require('mongoose');

const twoFactorAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    method: {
      type: String,
      enum: ['totp', 'sms', 'email'],
      required: true
    },
    isEnabled: { type: Boolean, default: false },
    secret: String,
    backupCodes: [String],
    phoneNumber: String,
    lastUsed: Date,
    failedAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockedUntil: Date,
    recoveryEmail: String,
    trustedDevices: [
      {
        deviceId: String,
        deviceName: String,
        fingerprint: String,
        addedAt: Date,
        lastUsedAt: Date,
        isActive: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('TwoFactorAuth', twoFactorAuthSchema);
