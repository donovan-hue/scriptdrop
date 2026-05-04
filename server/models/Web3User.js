const mongoose = require('mongoose');

const web3UserSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: [true, 'Wallet address is required'],
      unique: true,
      lowercase: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid Ethereum wallet address']
    },
    ens: {
      type: String,
      default: null
    },
    nonce: {
      type: String,
      required: true
    },
    nonceExpiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    chainId: {
      type: Number,
      default: 1 // Ethereum mainnet
    },
    balance: {
      type: String,
      default: '0'
    },
    networkName: {
      type: String,
      default: 'ethereum'
    },
    lastLoginAt: Date,
    signatureCount: {
      type: Number,
      default: 0
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    linkedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    metadata: {
      userAgent: String,
      ipAddress: String
    }
  },
  { timestamps: true }
);

// Index for cleanup of expired nonces
web3UserSchema.index({ nonceExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate nonce
web3UserSchema.methods.generateNonce = function () {
  this.nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.nonceExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  return this.nonce;
};

// Check if nonce is expired
web3UserSchema.methods.isNonceExpired = function () {
  return new Date() > this.nonceExpiresAt;
};

// Reset failed attempts
web3UserSchema.methods.resetFailedAttempts = function () {
  this.failedAttempts = 0;
};

// Increment failed attempts
web3UserSchema.methods.incrementFailedAttempts = function () {
  this.failedAttempts += 1;
  if (this.failedAttempts >= 5) {
    this.nonceExpiresAt = new Date(Date.now() - 1000); // Invalidate nonce
  }
};

module.exports = mongoose.model('Web3User', web3UserSchema);
