const mongoose = require('mongoose');

const contentReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contentType: {
      type: String,
      enum: ['post', 'comment', 'product', 'user', 'message'],
      required: true
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'fraud', 'copyright', 'violence', 'nsfw', 'other'],
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected', 'resolved'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser'
    },
    adminNotes: String,
    adminDecision: {
      type: String,
      enum: ['no_action', 'warning', 'content_removed', 'account_suspended', 'account_banned'],
      default: null
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser'
    },
    appealId: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);

contentReportSchema.index({ status: 1, priority: -1 });
contentReportSchema.index({ reportedBy: 1 });
contentReportSchema.index({ contentId: 1 });

module.exports = mongoose.model('ContentReport', contentReportSchema);
