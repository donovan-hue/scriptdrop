const mongoose = require('mongoose');

const rewardPoolSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      unique: true,
    },
    totalRewardAmount: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: mongoose.Types.Decimal128.fromString('1000'),
    },
    distributedAmount: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    remainingAmount: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('1000'),
    },
    totalAttentionSeconds: {
      type: Number,
      default: 0,
    },
    rewardDistributions: [
      {
        creatorId: mongoose.Schema.Types.ObjectId,
        amount: mongoose.Types.Decimal128,
        tokensPerSecond: Number,
        totalTimeSpent: Number,
        contentCount: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    burnedAmount: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
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
  { collection: 'reward_pools' }
);

rewardPoolSchema.index({ date: -1 });
rewardPoolSchema.index({ status: 1 });

module.exports = mongoose.model('RewardPool', rewardPoolSchema);
