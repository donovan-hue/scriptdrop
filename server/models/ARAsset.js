const mongoose = require('mongoose');

const ARAssetSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    modelUrl: {
      type: String,
      required: true,
      description: 'URL to 3D model file (GLTF/GLB format)',
    },
    modelFormat: {
      type: String,
      enum: ['gltf', 'glb', 'fbx', 'obj'],
      default: 'glb',
    },
    thumbnailUrl: {
      type: String,
      description: 'Preview thumbnail for the 3D model',
    },
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 },
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    variations: [
      {
        name: String, // e.g., "Color: Red", "Size: M"
        modelUrl: String,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    metadata: {
      creator: String,
      description: String,
      tags: [String],
      rigType: {
        type: String,
        enum: ['humanoid', 'none', 'custom'],
        default: 'humanoid',
      },
      boundingBox: {
        min: { x: Number, y: Number, z: Number },
        max: { x: Number, y: Number, z: Number },
      },
    },
    performanceSettings: {
      maxPolyCount: { type: Number, default: 100000 },
      useLOD: { type: Boolean, default: true },
      materialQuality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ARAssetSchema.index({ productId: 1, isActive: 1 });
ARAssetSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ARAsset', ARAssetSchema);
