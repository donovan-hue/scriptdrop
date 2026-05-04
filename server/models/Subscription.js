const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tier: {
      type: String,
      enum: ['free', 'pro', 'business'],
      default: 'free'
    },
    stripeCustomerId: {
      type: String,
      index: true,
      sparse: true
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
      sparse: true,
      unique: true
    },
    stripePriceId: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'unpaid'],
      default: 'active',
      index: true
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    canceledAt: Date
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
