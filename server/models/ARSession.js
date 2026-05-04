const mongoose = require('mongoose');

const ARSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sessionData: {
      duration: Number, // in seconds
      startTime: Date,
      endTime: Date,
      deviceInfo: {
        userAgent: String,
        isMobile: Boolean,
        screenWidth: Number,
        screenHeight: Number,
      },
      cameraPermissionGranted: Boolean,
    },
    poseData: [
      {
        timestamp: Date,
        landmarks: mongoose.Schema.Types.Mixed, // MediaPipe landmarks
        confidence: Number,
      },
    ],
    previewData: {
      videoUrl: String, // URL to recorded try-on video
      screenshotUrl: String, // URL to screenshot
      timestamp: Date,
    },
    productVariations: {
      color: String,
      size: String,
      customOptions: mongoose.Schema.Types.Mixed,
    },
    interactions: {
      zoomEvents: [{ timestamp: Date, level: Number }],
      rotationEvents: [{ timestamp: Date, angle: Number }],
      poseChanges: [{ timestamp: Date, poseType: String }],
    },
    analytics: {
      engagementScore: Number,
      timeSpentSeconds: Number,
      viewAngles: [Number], // Angles user viewed from
      modelRotations: Number,
      zoomInCount: Number,
      zoomOutCount: Number,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Indexes for queries
ARSessionSchema.index({ userId: 1, createdAt: -1 });
ARSessionSchema.index({ productId: 1, createdAt: -1 });
ARSessionSchema.index({ shareToken: 1 }, { sparse: true });

module.exports = mongoose.model('ARSession', ARSessionSchema);
