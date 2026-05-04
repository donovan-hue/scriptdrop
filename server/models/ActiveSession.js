const mongoose = require('mongoose');

const activeSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    deviceInfo: {
      browser: String,
      os: String,
      deviceType: String,
      deviceId: String
    },
    ipAddress: String,
    location: {
      country: String,
      city: String,
      timezone: String
    },
    isActive: { type: Boolean, default: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    },
    lastActivityAt: Date,
    logoutAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActiveSession', activeSessionSchema);
