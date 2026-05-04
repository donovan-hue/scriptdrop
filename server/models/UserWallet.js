const mongoose = require('mongoose');

const userWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    walletAddress: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    tokenBalance: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    stakedTokens: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    unstakedTokens: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    pendingRewards: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    totalEarned: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    totalStaked: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    totalWithdrawn: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    lastRewardClaimDate: {
      type: Date,
      default: null,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    stakes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stake',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'user_wallets' }
);

userWalletSchema.index({ userId: 1 });
userWalletSchema.index({ walletAddress: 1 });
userWalletSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserWallet', userWalletSchema);
