const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    fromWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserWallet',
      required: false,
    },
    toWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserWallet',
      required: true,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    type: {
      type: String,
      enum: ['transfer', 'reward', 'stake', 'unstake', 'burn', 'swap'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    transactionHash: {
      type: String,
      required: false,
    },
    blockNumber: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    metadata: {
      contentId: mongoose.Schema.Types.ObjectId,
      stakeId: mongoose.Schema.Types.ObjectId,
      reason: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'transactions' }
);

transactionSchema.index({ fromWalletId: 1, toWalletId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
