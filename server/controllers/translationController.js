// Translation Controller - Real-time Translation API
const Translation = require('../models/Translation');
const TranslationCache = require('../models/TranslationCache');
const translationService = require('../services/translationService');

// @desc    Translate text to multiple languages
// @route   POST /api/translation/translate
// @access  Public
exports.translateText = async (req, res) => {
  try {
    const { text, sourceLang, targetLangs, provider, context, sourceId, sourceType } = req.body;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    if (!sourceLang) {
      return res.status(400).json({
        success: false,
        message: 'Source language is required'
      });
    }

    if (!targetLangs || targetLangs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Target languages are required'
      });
    }

    // Translate
    const result = await translationService.translateText(
      text,
      sourceLang,
      targetLangs,
      provider || 'google'
    );

    if (!result.success && !result.cached) {
      return res.status(500).json({
        success: false,
        message: 'Translation failed',
        error: result.error
      });
    }

    // Save translation record if not cached
    if (!result.cached && req.user) {
      const savedTranslation = await translationService.saveTranslation(
        text,
        sourceLang,
        targetLangs,
        req.user.id,
        { context, sourceId, sourceType, provider: result.provider }
      );

      result.translationId = savedTranslation._id;
    }

    res.status(200).json({
      success: true,
      data: {
        originalText: text,
        originalLanguage: sourceLang,
        targetLanguages: targetLangs,
        translations: result.translations,
        provider: result.provider,
        confidence: result.confidence,
        cached: result.cached,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error translating text',
      error: error.message
    });
  }
};

// @desc    Translate batch content
// @route   POST /api/translation/batch
// @access  Public
exports.translateBatch = async (req, res) => {
  try {
    const { items, sourceLang, targetLangs, provider } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const result = await translationService.translateText(
          item.text,
          sourceLang || item.language,
          targetLangs,
          provider
        );

        results.push({
          originalText: item.text,
          translations: result.translations,
          itemId: item.id,
          success: true
        });
      } catch (err) {
        errors.push({
          itemId: item.id,
          error: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      count: results.length,
      errors: errors.length,
      data: results,
      failures: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Batch translation error',
      error: error.message
    });
  }
};

// @desc    Detect language of text
// @route   POST /api/translation/detect
// @access  Public
exports.detectLanguage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for language detection'
      });
    }

    const detection = await translationService.detectLanguage(text);

    res.status(200).json({
      success: true,
      data: detection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Language detection error',
      error: error.message
    });
  }
};

// @desc    Get supported languages
// @route   GET /api/translation/languages
// @access  Public
exports.getSupportedLanguages = async (req, res) => {
  try {
    const languages = translationService.getSupportedLanguages();

    res.status(200).json({
      success: true,
      count: Object.keys(languages).length,
      data: languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching languages',
      error: error.message
    });
  }
};

// @desc    Get translation history for user
// @route   GET /api/translation/history
// @access  Private
exports.getTranslationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, context } = req.query;

    const skip = (page - 1) * limit;
    let filter = { authorId: req.user.id };

    if (context) {
      filter.context = context;
    }

    const translations = await Translation.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Translation.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: translations.length,
      total,
      pages: Math.ceil(total / limit),
      data: translations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching translation history',
      error: error.message
    });
  }
};

// @desc    Get translation statistics
// @route   GET /api/translation/stats
// @access  Private
exports.getTranslationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = {
      totalTranslations: await Translation.countDocuments({ authorId: userId }),
      byContext: await Translation.collection.aggregate([
        { $match: { authorId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$context', count: { $sum: 1 } } }
      ]).toArray(),
      byProvider: await Translation.collection.aggregate([
        { $match: { authorId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$provider', count: { $sum: 1 } } }
      ]).toArray(),
      topLanguages: await Translation.collection.aggregate([
        { $match: { authorId: mongoose.Types.ObjectId(userId) } },
        { $unwind: '$targetLanguages' },
        { $group: { _id: '$targetLanguages', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray(),
      averageQualityScore: await Translation.collection.aggregate([
        { $match: { authorId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avg: { $avg: '$qualityScore' } } }
      ]).toArray()
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get cache statistics
// @route   GET /api/translation/cache/stats
// @access  Public
exports.getCacheStats = async (req, res) => {
  try {
    const stats = {
      totalCached: await TranslationCache.countDocuments({}),
      activeCached: await TranslationCache.countDocuments({ isValid: true }),
      totalHits: await TranslationCache.collection.aggregate([
        { $group: { _id: null, totalHits: { $sum: '$hitCount' } } }
      ]).toArray(),
      byProvider: await TranslationCache.collection.aggregate([
        { $group: { _id: '$provider', count: { $sum: 1 } } }
      ]).toArray(),
      cacheSize: await TranslationCache.collection.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$sizeInBytes' } } }
      ]).toArray()
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cache stats',
      error: error.message
    });
  }
};

// @desc    Clear translation cache
// @route   DELETE /api/translation/cache
// @access  Admin only
exports.clearCache = async (req, res) => {
  try {
    const result = await TranslationCache.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'Cache cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message
    });
  }
};

// @desc    Save user translation correction
// @route   POST /api/translation/:id/correct
// @access  Private
exports.saveCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const { language, correctedText } = req.body;

    const translation = await Translation.findById(id);

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: 'Translation not found'
      });
    }

    translation.corrections.push({
      language,
      correctedText,
      userId: req.user.id,
      timestamp: new Date()
    });

    await translation.save();

    res.status(200).json({
      success: true,
      message: 'Correction saved',
      data: translation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving correction',
      error: error.message
    });
  }
};
