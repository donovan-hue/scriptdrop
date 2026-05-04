const mongoose = require('mongoose');

const storyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true
    },
    currentNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoryNode'
    },
    visitedNodes: [
      {
        nodeId: mongoose.Schema.Types.ObjectId,
        visitedAt: Date,
        timeSpent: Number
      }
    ],
    choicesMade: [
      {
        nodeId: mongoose.Schema.Types.ObjectId,
        choiceIndex: Number,
        chosenAt: Date
      }
    ],
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    endingReached: {
      type: String,
      enum: ['good', 'bad', 'neutral', 'special'],
      default: null
    },
    totalTimeSpent: Number,
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastSessionEnd: Date,
    sessions: {
      type: Number,
      default: 1
    },
    bookmarked: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: String,
    sharingStats: {
      timesShared: { type: Number, default: 0 },
      sharedWith: [String]
    }
  },
  { timestamps: true }
);

storyProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });
storyProgressSchema.index({ userId: 1, isCompleted: 1 });
storyProgressSchema.index({ storyId: 1 });

module.exports = mongoose.model('StoryProgress', storyProgressSchema);
