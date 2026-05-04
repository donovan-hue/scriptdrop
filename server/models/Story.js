const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      maxlength: 1000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    genre: {
      type: String,
      enum: ['fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'adventure', 'comedy', 'other'],
      default: 'adventure'
    },
    cover: {
      type: String,
      default: null
    },
    startNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoryNode'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    stats: {
      views: { type: Number, default: 0 },
      plays: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      averagePlayTime: { type: Number, default: 0 },
      uniquePlayers: { type: Number, default: 0 }
    },
    choices: {
      total: { type: Number, default: 0 },
      branching: { type: Number, default: 0 }
    },
    tags: [String],
    isPublic: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    allowSharing: { type: Boolean, default: true }
  },
  { timestamps: true }
);

storySchema.index({ author: 1, status: 1 });
storySchema.index({ genre: 1, status: 1 });
storySchema.index({ 'rating.average': -1 });
storySchema.index({ 'stats.plays': -1 });

module.exports = mongoose.model('Story', storySchema);
