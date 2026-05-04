const mongoose = require('mongoose');

const arProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    model3D: {
      url: String,
      format: { type: String, enum: ['glb', 'gltf', 'usdz'], default: 'glb' },
      scale: { type: Number, default: 1 },
      rotation: [Number]
    },
    textures: [
      {
        name: String,
        url: String,
        type: { type: String, enum: ['color', 'normal', 'metallic', 'roughness'] }
      }
    ],
    size: {
      width: Number,
      height: Number,
      depth: Number
    },
    categories: {
      clothing: { fit: String, size: String },
      shoes: { size: String, width: String },
      accessories: { dimensions: String }
    },
    poseDetection: {
      enabled: { type: Boolean, default: true },
      bodyParts: [String],
      accuracy: { type: Number, default: 0.85 }
    },
    lightingPresets: [
      {
        name: String,
        intensity: Number,
        color: String
      }
    ],
    analytics: {
      timesTried: { type: Number, default: 0 },
      avgWearTime: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      satisfaction: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ARProduct', arProductSchema);
