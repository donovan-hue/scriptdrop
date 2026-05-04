const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['post', 'product', 'story', 'user', 'audio_room'], required: true },
  action: {
    type: String,
    enum: ['view', 'like', 'comment', 'share', 'purchase', 'follow', 'save', 'skip', 'dwell'],
    required: true
  },
  dwellTime: { type: Number, default: 0 }, // seconds spent on content
  score: { type: Number, default: 1 },     // weight of this interaction
  tags: [String],
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 } // 30 days TTL
});

userInteractionSchema.index({ userId: 1, targetType: 1, createdAt: -1 });
userInteractionSchema.index({ targetId: 1, action: 1 });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
