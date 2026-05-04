// Translation Model - Real-time Automatic Translation
const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema(
  {
    // Original content
    originalText: {
      type: String,
      required: [true, 'Original text is required'],
      maxlength: [5000, 'Text cannot exceed 5000 characters']
    },
    originalLanguage: {
      type: String,
      default: 'en',
      lowercase: true,
      enum: ['es', 'en', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'ja', 'zh', 'ar', 'ko', 'nl', 'sv', 'da', 'no', 'fi', 'tr', 'el', 'hu', 'ro', 'cs', 'sk', 'sl', 'bg', 'hr', 'sr', 'uk', 'he', 'fa', 'ur', 'hi', 'bn', 'ta', 'te', 'th', 'vi', 'id', 'my', 'km', 'lo', 'tl', 'ca', 'eu', 'gl'],
      required: true
    },
    // Translated content
    translations: {
      type: Map,
      of: String,
      default: new Map()
    },
    targetLanguages: [String],
    // Context information
    context: {
      type: String,
      enum: ['post', 'message', 'product', 'comment', 'bio', 'feed'],
      default: 'post'
    },
    // Source
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post' // Can reference different models
    },
    sourceType: {
      type: String,
      enum: ['post', 'message', 'product', 'profile'],
      default: 'post'
    },
    // User
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Translation metadata
    detectedLanguage: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.95
    },
    provider: {
      type: String,
      enum: ['google', 'deepl', 'azure', 'local'],
      default: 'google'
    },
    // Quality metrics
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    // Cache control
    isCached: {
      type: Boolean,
      default: false
    },
    cacheExpiry: Date,
    // User corrections (crowdsourcing)
    corrections: [{
      language: String,
      correctedText: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votes: { type: Number, default: 1 },
      timestamp: Date
    }],
    // Stats
    viewCount: {
      type: Number,
      default: 0
    },
    translationCount: {
      type: Number,
      default: 1
    },
    // Active status
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index para búsqueda rápida
TranslationSchema.index({ authorId: 1, createdAt: -1 });
TranslationSchema.index({ sourceId: 1 });
TranslationSchema.index({ originalLanguage: 1 });
TranslationSchema.index({ targetLanguages: 1 });

// TTL Index - Auto delete translations after 90 days if not active
TranslationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000, partialFilterExpression: { isActive: false } }
);

module.exports = mongoose.model('Translation', TranslationSchema);
