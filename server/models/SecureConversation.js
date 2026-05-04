const mongoose = require('mongoose');

const secureConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        publicKey: String,
        joinedAt: Date
      }
    ],
    conversationKey: String,
    encryptionMetadata: {
      algorithm: { type: String, default: 'AES-256-GCM' },
      dhPublicKey: String,
      secrets: [String]
    },
    isArchived: { type: Boolean, default: false },
    archivedAt: Date,
    isParanoia: {
      type: Boolean,
      default: true,
      description: 'Paranoia mode - max privacy'
    },
    paranoiaSettings: {
      messageExpiration: { type: Number, default: 60 },
      screenshotProtection: { type: Boolean, default: true },
      readReceipts: { type: Boolean, default: false },
      typingIndicators: { type: Boolean, default: false },
      messageWithdrawal: { type: Boolean, default: true },
      metadataMinimization: { type: Boolean, default: true }
    },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: Date,
    unreadCounts: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        count: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('SecureConversation', secureConversationSchema);
