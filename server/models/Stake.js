const mongoose = require('mongoose');

const stakeSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserWallet',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    lockPeriod: {
      type: Number,
      enum: [30, 60, 90],
      required: true,
    },
    apy: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    rewardsEarned: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    claimedAt: {
      type: Date,
      default: null,
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
  { collection: 'stakes' }
);

stakeSchema.index({ userId: 1 });
stakeSchema.index({ walletId: 1 });
stakeSchema.index({ status: 1 });
stakeSchema.index({ endDate: 1 });

module.exports = mongoose.model('Stake', stakeSchema);
