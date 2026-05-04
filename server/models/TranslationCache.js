// Translation Cache Model - Optimize repeated translations
const mongoose = require('mongoose');

const TranslationCacheSchema = new mongoose.Schema(
  {
    // Cache key
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    // Original text hash
    textHash: {
      type: String,
      required: true,
      index: true
    },
    // Text range info
    originalText: {
      type: String,
      required: true
    },
    originalLanguage: {
      type: String,
      required: true,
      lowercase: true
    },
    // Cached translations
    cachedTranslations: {
      type: Map,
      of: String,
      default: new Map()
    },
    translationLanguages: [String],
    // Cache metadata
    provider: {
      type: String,
      enum: ['google', 'deepl', 'azure'],
      default: 'google'
    },
    // Hit tracking
    hitCount: {
      type: Number,
      default: 0
    },
    lastAccessed: Date,
    // Quality score
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    // Expiration
    expiresAt: Date,
    // Status
    isValid: {
      type: Boolean,
      default: true
    },
    // Size in bytes
    sizeInBytes: Number
  },
  { timestamps: true }
);

// TTL Index - Auto-delete cache after 30 days
TranslationCacheSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Index for efficient lookup
TranslationCacheSchema.index({ originalLanguage: 1, 'cachedTranslations': 1 });

module.exports = mongoose.model('TranslationCache', TranslationCacheSchema);
