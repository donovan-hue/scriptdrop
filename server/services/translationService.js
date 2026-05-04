// Translation Service - Multi-provider support
const axios = require('axios');
const crypto = require('crypto');
const Translation = require('../models/Translation');
const TranslationCache = require('../models/TranslationCache');
const { isEnvKeyMissing } = require('../utils/apiKeyUtils');

// Supported languages - 50+ languages
const SUPPORTED_LANGUAGES = {
  // Major European Languages
  'es': 'Spanish',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'pl': 'Polish',
  'ru': 'Russian',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'tr': 'Turkish',
  'el': 'Greek',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'cs': 'Czech',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'uk': 'Ukrainian',
  'ca': 'Catalan',
  'eu': 'Basque',
  'gl': 'Galician',
  // Asian Languages
  'ja': 'Japanese',
  'zh': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'ko': 'Korean',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'tl': 'Filipino',
  // Middle Eastern/South Asian Languages
  'ar': 'Arabic',
  'he': 'Hebrew',
  'fa': 'Persian',
  'ur': 'Urdu',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu'
};

// Use shared helper so the placeholder-detection logic stays in one place
const _isMissing = isEnvKeyMissing;

class TranslationService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.deeplApiKey = process.env.DEEPL_API_KEY;
    this.azureEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
    this.azureKey = process.env.AZURE_TRANSLATOR_KEY;

    const anyConfigured =
      !_isMissing(this.googleApiKey) ||
      !_isMissing(this.deeplApiKey) ||
      (!_isMissing(this.azureEndpoint) && !_isMissing(this.azureKey));

    if (!anyConfigured) {
      console.warn('⚠️  Servicio de traduccion no configurado - retornando texto original');
    }
  }

  // Combines hashing and key construction — they are always called together
  generateCacheKey(text, sourceLang, targetLangs) {
    const hash = crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex').substring(0, 16);
    return `${sourceLang}:${targetLangs.join(',')}-${hash}`;
  }

  /**
   * Check cache for existing translation
   */
  async checkCache(text, sourceLang, targetLangs) {
    try {
      const cacheKey = this.generateCacheKey(text, sourceLang, targetLangs);

      const cached = await TranslationCache.findOne({
        cacheKey,
        isValid: true,
        expiresAt: { $gt: new Date() }
      });

      if (cached) {
        // Fire-and-forget — don't block the response for a stats update
        TranslationCache.updateOne(
          { _id: cached._id },
          { $inc: { hitCount: 1 }, $set: { lastAccessed: new Date() } }
        ).catch(() => {});

        return {
          found: true,
          translations: Object.fromEntries(cached.cachedTranslations),
          provider: cached.provider,
          cached: true
        };
      }

      return { found: false };
    } catch (err) {
      console.error('Error checking cache:', err);
      return { found: false };
    }
  }

  /**
   * Translate with Google Translate API
   */
  async translateWithGoogle(text, sourceLang, targetLangs) {
    try {
      if (!this.googleApiKey) {
        throw new Error('Google Translate API key not configured');
      }

      const translations = {};

      for (const targetLang of targetLangs) {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`,
          {
            q: text,
            source_language: sourceLang,
            target_language: targetLang
          },
          { timeout: 10000 }
        );

        if (response.data.data?.translations?.length > 0) {
          translations[targetLang] = response.data.data.translations[0].translatedText;
        }
      }

      return {
        success: true,
        translations,
        provider: 'google',
        confidence: 0.95
      };
    } catch (err) {
      console.error('Google Translation error:', err.message);
      return {
        success: false,
        error: err.message,
        provider: 'google'
      };
    }
  }

  /**
   * Translate with DeepL API
   */
  async translateWithDeepL(text, sourceLang, targetLangs) {
    try {
      if (!this.deeplApiKey) {
        throw new Error('DeepL API key not configured');
      }

      const translations = {};

      for (const targetLang of targetLangs) {
        const response = await axios.post(
          'https://api-free.deepl.com/v1/document',
          {
            text,
            source_lang: sourceLang.toUpperCase(),
            target_lang: targetLang.toUpperCase()
          },
          {
            headers: {
              'Authorization': `DeepL-Auth-Key ${this.deeplApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        if (response.data?.translations?.length > 0) {
          translations[targetLang] = response.data.translations[0].text;
        }
      }

      return {
        success: true,
        translations,
        provider: 'deepl',
        confidence: 0.97
      };
    } catch (err) {
      console.error('DeepL Translation error:', err.message);
      return {
        success: false,
        error: err.message,
        provider: 'deepl'
      };
    }
  }

  /**
   * Translate with Azure Translator
   */
  async translateWithAzure(text, sourceLang, targetLangs) {
    try {
      if (!this.azureEndpoint || !this.azureKey) {
        throw new Error('Azure Translator not configured');
      }

      const translations = {};

      for (const targetLang of targetLangs) {
        const response = await axios.post(
          `${this.azureEndpoint}/translate`,
          `"${text}"`,
          {
            headers: {
              'Content-Type': 'application/xml',
              'Ocp-Apim-Subscription-Key': this.azureKey,
              'Ocp-Apim-Subscription-Region': 'global'
            },
            params: {
              'api-version': '3.0',
              from: sourceLang,
              to: targetLang
            },
            timeout: 10000
          }
        );

        if (response.data?.[0]?.translations?.length > 0) {
          translations[targetLang] = response.data[0].translations[0].text;
        }
      }

      return {
        success: true,
        translations,
        provider: 'azure',
        confidence: 0.96
      };
    } catch (err) {
      console.error('Azure Translation error:', err.message);
      return {
        success: false,
        error: err.message,
        provider: 'azure'
      };
    }
  }

  /**
   * Offline translation fallback (simple word-by-word dictionary)
   */
  async translateWithOffline(text, sourceLang, targetLangs) {
    try {
      // Simple offline dictionary for common phrases
      const offlineDictionary = {
        es: {
          en: {
            'hola': 'hello',
            'buenos días': 'good morning',
            'buenas noches': 'good night',
            'gracias': 'thank you',
            'por favor': 'please',
            'sí': 'yes',
            'no': 'no',
            'cómo estás': 'how are you',
            'me llamo': 'my name is',
            'encantado': 'nice to meet you'
          }
        },
        en: {
          es: {
            'hello': 'hola',
            'good morning': 'buenos días',
            'good night': 'buenas noches',
            'thank you': 'gracias',
            'please': 'por favor',
            'yes': 'sí',
            'no': 'no',
            'how are you': 'cómo estás',
            'my name is': 'me llamo',
            'nice to meet you': 'encantado'
          }
        }
      };

      const translations = {};

      for (const targetLang of targetLangs) {
        let translated = text;

        if (offlineDictionary[sourceLang]?.[targetLang]) {
          const dict = offlineDictionary[sourceLang][targetLang];
          for (const [key, value] of Object.entries(dict)) {
            const regex = new RegExp('\\b' + key + '\\b', 'gi');
            translated = translated.replace(regex, value);
          }
        }

        translations[targetLang] = translated;
      }

      return {
        success: true,
        translations,
        provider: 'offline',
        confidence: 0.6,
        isOffline: true
      };
    } catch (err) {
      console.error('Offline translation error:', err);
      return {
        success: false,
        error: err.message,
        provider: 'offline'
      };
    }
  }

  /**
   * Main translation method with fallback
   */
  async translateText(text, sourceLang, targetLangs, provider = 'google') {
    try {
      // Validate inputs
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      if (!SUPPORTED_LANGUAGES[sourceLang]) {
        throw new Error(`Unsupported source language: ${sourceLang}`);
      }

      targetLangs = targetLangs.filter(lang => SUPPORTED_LANGUAGES[lang]);

      if (targetLangs.length === 0) {
        throw new Error('No valid target languages');
      }

      // Check cache first
      const cached = await this.checkCache(text, sourceLang, targetLangs);
      if (cached.found) {
        return cached;
      }

      // Try primary provider
      let result = null;

      switch (provider) {
        case 'deepl':
          result = await this.translateWithDeepL(text, sourceLang, targetLangs);
          if (!result.success) {
            result = await this.translateWithGoogle(text, sourceLang, targetLangs);
          }
          break;
        case 'azure':
          result = await this.translateWithAzure(text, sourceLang, targetLangs);
          if (!result.success) {
            result = await this.translateWithGoogle(text, sourceLang, targetLangs);
          }
          break;
        default: // Google
          result = await this.translateWithGoogle(text, sourceLang, targetLangs);
          if (!result.success) {
            result = await this.translateWithDeepL(text, sourceLang, targetLangs);
          }
      }

      if (!result || !result.success) {
        return this._originalTextFallback(text, targetLangs);
      }

      // Fire-and-forget — don't block the response for a cache write
      this.cacheTranslation(text, sourceLang, targetLangs, result).catch(() => {});

      result.cached = false;
      return result;
    } catch (err) {
      console.error('Translation error:', err);
      return this._originalTextFallback(text, targetLangs || []);
    }
  }

  _originalTextFallback(text, targetLangs) {
    console.warn('⚠️  Servicio de traduccion no configurado - retornando texto original');
    const translations = {};
    targetLangs.forEach(lang => { translations[lang] = text; });
    return { success: true, translations, provider: 'none', confidence: 0, cached: false, isOriginal: true };
  }

  /**
   * Cache translation result
   */
  async cacheTranslation(text, sourceLang, targetLangs, result) {
    try {
      const cacheKey = this.generateCacheKey(text, sourceLang, targetLangs);
      const textHash = this.hashText(text);

      const cache = new TranslationCache({
        cacheKey,
        textHash,
        originalText: text,
        originalLanguage: sourceLang,
        cachedTranslations: new Map(Object.entries(result.translations)),
        translationLanguages: targetLangs,
        provider: result.provider,
        qualityScore: Math.round(result.confidence * 100),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sizeInBytes: Buffer.byteLength(JSON.stringify(result.translations))
      });

      await cache.save();
    } catch (err) {
      console.error('Error caching translation:', err);
      // Non-blocking - continue even if cache fails
    }
  }

  /**
   * Save translation to database
   */
  async saveTranslation(text, sourceLang, targetLangs, authorId, sourceData) {
    try {
      const translation = new Translation({
        originalText: text,
        originalLanguage: sourceLang,
        targetLanguages: targetLangs,
        authorId,
        context: sourceData.context || 'post',
        sourceId: sourceData.sourceId,
        sourceType: sourceData.sourceType || 'post',
        detectedLanguage: sourceLang,
        provider: sourceData.provider || 'google'
      });

      await translation.save();
      return translation;
    } catch (err) {
      console.error('Error saving translation:', err);
      throw err;
    }
  }

  /**
   * Get languages list
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Detect language
   */
  async detectLanguage(text) {
    try {
      // Simple detection based on common words
      const detectors = {
        es: /\b(el|la|de|que|es|un|una|los|las)\b/gi,
        en: /\b(the|be|to|of|and|a|in|is|was|or)\b/gi,
        fr: /\b(le|la|de|et|un|une|les|est|que)\b/gi,
        de: /\b(der|die|das|von|und|ein|eine|den|den)\b/gi
      };

      let maxMatches = 0;
      let detectedLang = 'es';

      for (const [lang, pattern] of Object.entries(detectors)) {
        const matches = text.match(pattern) || [];
        if (matches.length > maxMatches) {
          maxMatches = matches.length;
          detectedLang = lang;
        }
      }

      return {
        language: detectedLang,
        confidence: Math.min(0.95, (maxMatches / (text.split(' ').length / 2)) * 0.8)
      };
    } catch (err) {
      console.error('Error detecting language:', err);
      return { language: 'es', confidence: 0.5 };
    }
  }
}

module.exports = new TranslationService();
