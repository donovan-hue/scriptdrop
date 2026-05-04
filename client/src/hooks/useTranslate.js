// useTranslate Hook - Simplified translation interface
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useTranslate = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translateText = useCallback(async (text, targetLanguages, sourceLanguage = 'auto') => {
    setIsTranslating(true);
    setError(null);

    try {
      // Auto-detect if needed
      let source = sourceLanguage;

      if (sourceLanguage === 'auto') {
        const detectionResponse = await axios.post('/api/translation/detect', { text });
        if (detectionResponse.data.success) {
          source = detectionResponse.data.data.language;
        }
      }

      // Translate
      const response = await axios.post('/api/translation/translate', {
        text,
        sourceLang: source,
        targetLangs: Array.isArray(targetLanguages) ? targetLanguages : [targetLanguages]
      });

      if (response.data.success) {
        return {
          success: true,
          original: text,
          source: source,
          translations: response.data.data.translations,
          provider: response.data.data.provider,
          confidence: response.data.data.confidence,
          cached: response.data.data.cached
        };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }

    return null;
  }, []);

  const translateBatch = useCallback(async (items, targetLanguages, sourceLanguage = 'auto') => {
    setIsTranslating(true);
    setError(null);

    try {
      const response = await axios.post('/api/translation/batch', {
        items,
        sourceLang: sourceLanguage,
        targetLangs: Array.isArray(targetLanguages) ? targetLanguages : [targetLanguages]
      });

      if (response.data.success) {
        return {
          success: true,
          results: response.data.data,
          errors: response.data.failures
        };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      console.error('Batch translation error:', err);
    } finally {
      setIsTranslating(false);
    }

    return null;
  }, []);

  const detectLanguage = useCallback(async (text) => {
    try {
      const response = await axios.post('/api/translation/detect', { text });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Language detection error:', err);
    }

    return null;
  }, []);

  const getSupportedLanguages = useCallback(async () => {
    try {
      const response = await axios.get('/api/translation/languages');

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching languages:', err);
    }

    return null;
  }, []);

  const getTranslationHistory = useCallback(async (page = 1, limit = 20, context = null) => {
    try {
      const params = { page, limit };
      if (context) params.context = context;

      const response = await axios.get('/api/translation/history', { params });

      if (response.data.success) {
        return {
          translations: response.data.data,
          total: response.data.total,
          pages: response.data.pages
        };
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }

    return null;
  }, []);

  const getTranslationStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/translation/stats');

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }

    return null;
  }, []);

  return {
    isTranslating,
    error,
    translateText,
    translateBatch,
    detectLanguage,
    getSupportedLanguages,
    getTranslationHistory,
    getTranslationStats
  };
};
