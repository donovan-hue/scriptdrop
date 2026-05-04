const mongoose = require('mongoose');

const attentionMetricsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    tokensEarned: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    interactionType: {
      type: String,
      enum: ['view', 'like', 'comment', 'share', 'read'],
      default: 'view',
    },
    isRewarded: {
      type: Boolean,
      default: false,
    },
    rewardDate: {
      type: Date,
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
    },
    metadata: {
      device: String,
      location: String,
      referrer: String,
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
  { collection: 'attention_metrics' }
);

attentionMetricsSchema.index({ userId: 1, contentId: 1 });
attentionMetricsSchema.index({ creatorId: 1 });
attentionMetricsSchema.index({ isRewarded: 1 });
attentionMetricsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AttentionMetrics', attentionMetricsSchema);
