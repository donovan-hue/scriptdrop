const mongoose = require('mongoose');

const emailQueueSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    template: {
      type: String,
      enum: ['welcome', 'password_reset', 'order_confirmation', 'delivery_update', 'verification'],
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    error: String,
    sentAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    }
  },
  { timestamps: true }
);

emailQueueSchema.index({ status: 1, priority: -1, createdAt: 1 });

module.exports = mongoose.model('EmailQueue', emailQueueSchema);
