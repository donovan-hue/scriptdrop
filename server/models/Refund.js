const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      enum: ['item_not_received', 'item_damaged', 'not_as_described', 'changed_mind', 'other'],
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'processed', 'completed'],
      default: 'requested'
    },
    stripeRefundId: String,
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    reviewNotes: String,
    returnStatus: {
      type: String,
      enum: ['pending', 'item_received', 'inspected', 'approved_return'],
      default: 'pending'
    },
    trackingNumber: String,
    completedAt: Date
  },
  { timestamps: true }
);

refundSchema.index({ userId: 1, status: 1 });
refundSchema.index({ orderId: 1 });

module.exports = mongoose.model('Refund', refundSchema);
