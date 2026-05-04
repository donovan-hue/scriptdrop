const mongoose = require('mongoose');

const arTryOnSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    arProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ARProduct'
    },
    sessionStarted: {
      type: Date,
      default: Date.now
    },
    sessionEnded: Date,
    duration: Number,
    screenshotsTaken: Number,
    videoRecorded: {
      type: Boolean,
      default: false
    },
    videoUrl: String,
    screenshots: [
      {
        url: String,
        timestamp: Date,
        filters: [String]
      }
    ],
    deviceInfo: {
      type: String,
      osType: String,
      cameraResolution: String,
      supportedFeatures: [String]
    },
    feedback: {
      fit: { type: String, enum: ['too-small', 'perfect', 'too-big'] },
      comfort: Number,
      style: Number,
      likelihood: { type: Number, min: 0, max: 1 },
      wouldBuy: Boolean,
      comments: String
    },
    purchaseDecision: {
      type: String,
      enum: ['interested', 'not-interested', 'will-decide-later'],
      default: 'will-decide-later'
    },
    cameraPermission: { type: Boolean, default: true },
    systemSettings: {
      lighting: String,
      backgroundColor: String,
      poseDetectionEnabled: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ARTryOnSession', arTryOnSessionSchema);
