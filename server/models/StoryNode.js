const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  nextNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoryNode'
  },
  consequence: {
    type: String,
    enum: ['ending', 'branch', 'loop'],
    default: 'branch'
  },
  stats: {
    chosen: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  }
}, { _id: false });

const storyNodeSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    isEnding: {
      type: Boolean,
      default: false
    },
    endingType: {
      type: String,
      enum: ['good', 'bad', 'neutral', 'special'],
      default: null
    },
    choices: [choiceSchema],
    nodeIndex: Number,
    depth: Number,
    branch: String,
    audio: {
      type: String,
      default: null
    },
    duration: Number,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

storyNodeSchema.index({ storyId: 1 });
storyNodeSchema.index({ storyId: 1, isEnding: 1 });

module.exports = mongoose.model('StoryNode', storyNodeSchema);
