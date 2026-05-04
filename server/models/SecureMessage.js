const mongoose = require('mongoose');

const secureMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    encryptedContent: {
      type: String,
      required: true
    },
    encryptionMethod: {
      type: String,
      enum: ['AES-256', 'ChaCha20'],
      default: 'AES-256'
    },
    iv: String,
    ephemeralPublicKey: String,
    messageHash: String,
    hasExpiration: { type: Boolean, default: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    isSelfDestruct: { type: Boolean, default: false },
    selfDestructTimer: { type: Number, default: 10 },
    reactions: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        emoji: String,
        timestamp: Date
      }
    ],
    metadata: {
      deviceInfo: String,
      location: String,
      ipHash: String
    },
    securityFlags: {
      screenshotBlocked: { type: Boolean, default: true },
      forwardingBlocked: { type: Boolean, default: true },
      copyBlocked: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

secureMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
secureMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SecureMessage', secureMessageSchema);
