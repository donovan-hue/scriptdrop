const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // post, product, story, etc.
  targetType: { type: String, enum: ['post', 'product', 'story', 'audio_room', 'general'] },
  message: { type: String, maxlength: 200 },
  anonymous: { type: Boolean, default: false },
  txHash: { type: String }, // optional on-chain reference
  createdAt: { type: Date, default: Date.now }
});

tipSchema.index({ toUser: 1, createdAt: -1 });
tipSchema.index({ fromUser: 1, createdAt: -1 });
tipSchema.index({ targetId: 1 });

module.exports = mongoose.model('Tip', tipSchema);
