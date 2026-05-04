const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    cloudinaryId: {
      type: String,
      required: true
    },
    cloudinaryUrl: String,
    thumbnailUrl: String,
    duration: Number,
    size: Number,
    format: String,
    resolution: String,
    publicId: String,
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading'
    },
    isPublic: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    tags: [String],
    category: String,
    processedFormats: {
      webm: String,
      mp4: String,
      thumbnail: String
    },
    analytics: {
      totalWatched: Number,
      avgWatchTime: Number,
      completionRate: Number
    }
  },
  { timestamps: true }
);

videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ isPublic: 1, createdAt: -1 });
videoSchema.index({ views: -1 });

module.exports = mongoose.model('Video', videoSchema);
