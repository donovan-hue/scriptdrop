const mongoose = require('mongoose');

const secureChatSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [
      {
        messageId: {
          type: String,
          required: true,
          unique: true,
          sparse: true,
        },
        encryptedContent: {
          type: String,
          required: true,
        },
        senderFingerprint: {
          type: String,
          required: true,
        },
        recipientFingerprint: {
          type: String,
          required: true,
        },
        nonce: {
          type: String,
          required: true,
        },
        ephemeralPublicKey: {
          type: String,
          default: null,
        },
        expiresAt: {
          type: Date,
          default: null,
          index: { expireAfterSeconds: 0 },
        },
        createdAt: {
          type: Date,
          default: Date.now,
          index: true,
        },
        isExpired: {
          type: Boolean,
          default: false,
        },
        readReceipt: {
          type: Boolean,
          default: false,
        },
      },
    ],
    participants: [
      {
        userId: String,
        fingerprint: String,
        publicKey: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    encryptionAlgorithm: {
      type: String,
      default: 'nacl.box',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      messageCount: { type: Number, default: 0 },
      lastMessageAt: Date,
      sessionKey: String,
    },
  },
  {
    timestamps: true,
    collection: 'secure_chats',
  }
);

secureChatSchema.index({ 'metadata.createdAt': -1 });
secureChatSchema.index({ 'participants.userId': 1 });

secureChatSchema.methods.addMessage = function (messageData) {
  this.messages.push(messageData);
  this.metadata.messageCount += 1;
  this.metadata.lastMessageAt = new Date();
  return this.save();
};

secureChatSchema.methods.expireMessages = function () {
  const now = new Date();
  this.messages.forEach((msg) => {
    if (msg.expiresAt && msg.expiresAt < now && !msg.isExpired) {
      msg.isExpired = true;
      msg.encryptedContent = '[expired]';
    }
  });
  return this.save();
};

secureChatSchema.methods.getActiveMessages = function () {
  return this.messages.filter((msg) => !msg.isExpired);
};

module.exports = mongoose.model('SecureChat', secureChatSchema);
