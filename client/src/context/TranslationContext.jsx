// Translation Context - Global translation state management
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translationProvider, setTranslationProvider] = useState('google');
  const [detectionEnabled, setDetectionEnabled] = useState(true);

  // Fetch supported languages on mount
  useEffect(() => {
    fetchSupportedLanguages();

    // Get user's preferred language from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && ['es', 'en', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'ja', 'zh', 'ar', 'ko'].includes(browserLang)) {
      // Don't override saved preference
      if (!savedLanguage) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const response = await fetch('/api/translation/languages');
      const data = await response.json();

      if (data.success) {
        setSupportedLanguages(data.data);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const changeLanguage = useCallback((lang) => {
    if (supportedLanguages[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
    }
  }, [supportedLanguages]);

  const translate = useCallback(
    async (text, targetLangs, sourceLang = 'auto', options = {}) => {
      try {
        setIsLoading(true);

        // Auto-detect source language if needed
        let source = sourceLang;
        if (sourceLang === 'auto' && detectionEnabled) {
          const detectionResponse = await fetch('/api/translation/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });

          const detectionData = await detectionResponse.json();
          if (detectionData.success) {
            source = detectionData.data.language;
          }
        }

        const response = await fetch('/api/translation/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang: source,
            targetLangs: Array.isArray(targetLangs) ? targetLangs : [targetLangs],
            provider: translationProvider,
            ...options
          })
        });

        const data = await response.json();

        if (data.success) {
          // Store translation in cache
          const cacheKey = `${source}:${targetLangs}:${text.substring(0, 50)}`;
          setTranslations((prev) => ({
            ...prev,
            [cacheKey]: data.data.translations
          }));

          return data.data;
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Translation error:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [translationProvider, detectionEnabled]
  );

  const detectLanguage = useCallback(async (text) => {
    try {
      const response = await fetch('/api/translation/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      }
    } catch (error) {
      console.error('Language detection error:', error);
    }

    return null;
  }, []);

  const getLanguageName = useCallback(
    (code) => {
      return supportedLanguages[code] || code;
    },
    [supportedLanguages]
  );

  const value = {
    currentLanguage,
    supportedLanguages,
    translations,
    isLoading,
    autoTranslate,
    translationProvider,
    detectionEnabled,
    changeLanguage,
    translate,
    detectLanguage,
    getLanguageName,
    setAutoTranslate,
    setTranslationProvider,
    setDetectionEnabled
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }

  return context;
};
