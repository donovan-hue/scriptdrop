const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: String,
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 }); // conversation thread queries
messageSchema.index({ receiver: 1, isRead: 1 });                // unread messages per user

module.exports = mongoose.model('Message', messageSchema);
