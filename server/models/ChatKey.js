const mongoose = require('mongoose');

const chatKeySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKeyHash: {
      type: String,
      required: true,
    },
    fingerprint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyRotationSchedule: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    keyExchangeHistory: [
      {
        exchangeId: String,
        remoteUserId: String,
        remoteFingerprint: String,
        ephemeralPublicKey: String,
        sharedSecret: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    verifiedKeys: [
      {
        userId: String,
        fingerprint: String,
        verifiedAt: Date,
        trustScore: { type: Number, min: 0, max: 100 },
      },
    ],
    revokedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      algorithm: { type: String, default: 'nacl.box' },
      keySize: { type: Number, default: 32 },
      createdAt: { type: Date, default: Date.now },
      lastUsedAt: Date,
      usageCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'chat_keys',
  }
);

chatKeySchema.index({ userId: 1, isActive: 1 });
chatKeySchema.index({ keyRotationSchedule: 1 });

chatKeySchema.methods.markAsUsed = function () {
  this.metadata.lastUsedAt = new Date();
  this.metadata.usageCount += 1;
  return this.save();
};

chatKeySchema.methods.rotateKey = function (newPublicKey, newPrivateKeyHash, newFingerprint) {
  this.publicKey = newPublicKey;
  this.privateKeyHash = newPrivateKeyHash;
  this.fingerprint = newFingerprint;
  this.keyRotationSchedule = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.save();
};

chatKeySchema.methods.revokeKey = function () {
  this.isActive = false;
  this.revokedAt = new Date();
  return this.save();
};

chatKeySchema.methods.recordKeyExchange = function (exchangeData) {
  this.keyExchangeHistory.push({
    exchangeId: exchangeData.exchangeId,
    remoteUserId: exchangeData.remoteUserId,
    remoteFingerprint: exchangeData.remoteFingerprint,
    ephemeralPublicKey: exchangeData.ephemeralPublicKey,
    sharedSecret: exchangeData.sharedSecret,
    timestamp: new Date(),
  });
  return this.save();
};

chatKeySchema.methods.verifyRemoteKey = function (userId, fingerprint, trustScore = 100) {
  const existingVerification = this.verifiedKeys.find(
    (key) => key.userId === userId && key.fingerprint === fingerprint
  );

  if (!existingVerification) {
    this.verifiedKeys.push({
      userId,
      fingerprint,
      verifiedAt: new Date(),
      trustScore,
    });
  } else {
    existingVerification.verifiedAt = new Date();
    existingVerification.trustScore = trustScore;
  }

  return this.save();
};

module.exports = mongoose.model('ChatKey', chatKeySchema);
