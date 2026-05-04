const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'],
      default: 'moderator'
    },
    permissions: [String],
    canModerate: { type: Boolean, default: true },
    canManageUsers: { type: Boolean, default: false },
    canManagePayments: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageContent: { type: Boolean, default: false },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active'
    },
    activityLog: [
      {
        action: String,
        details: String,
        timestamp: Date,
        targetId: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminUser', adminUserSchema);
