const mongoose = require('mongoose');

const userBlockSchema = new mongoose.Schema(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: String,
    blockType: {
      type: String,
      enum: ['user_block', 'admin_suspend', 'admin_ban'],
      default: 'user_block'
    },
    expiresAt: Date,
    isPermanent: { type: Boolean, default: false },
    adminReason: String,
    appealStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    appealMessage: String
  },
  { timestamps: true }
);

userBlockSchema.index({ blockedBy: 1, blockedUser: 1 }, { unique: true });
userBlockSchema.index({ blockedUser: 1 });

module.exports = mongoose.model('UserBlock', userBlockSchema);
