const mongoose = require('mongoose');

const cinemaRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  videoTitle: { type: String },
  videoDuration: { type: Number, default: 0 }, // seconds
  currentTime: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: { type: Number, default: 50 },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
  chat: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['waiting', 'playing', 'paused', 'ended'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 6 } // 6 hours TTL
});

cinemaRoomSchema.index({ host: 1 });
cinemaRoomSchema.index({ status: 1, isPrivate: 1 });

module.exports = mongoose.model('CinemaRoom', cinemaRoomSchema);
