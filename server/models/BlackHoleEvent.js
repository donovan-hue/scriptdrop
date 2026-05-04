const mongoose = require('mongoose');

const blackHoleEventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  maxParticipants: { type: Number, default: 1000 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  prizePool: { type: Number, default: 0 },      // KRO tokens
  entryFee: { type: Number, default: 0 },        // KRO to enter
  eventType: {
    type: String,
    enum: ['battle', 'collab', 'quiz', 'challenge', 'auction'],
    default: 'challenge'
  },
  rules: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  gravitationalPull: { type: Number, default: 0 }, // virality metric
  createdAt: { type: Date, default: Date.now }
});

blackHoleEventSchema.index({ status: 1, startTime: 1 });
blackHoleEventSchema.index({ creator: 1 });
blackHoleEventSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('BlackHoleEvent', blackHoleEventSchema);
