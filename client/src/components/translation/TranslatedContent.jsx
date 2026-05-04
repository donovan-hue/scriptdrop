// Translated Content Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslate } from '../../hooks/useTranslate';
import './translation.css';

const TranslatedContent = ({ content, sourceLanguage = 'auto', showOriginal = true }) => {
  const { translateText, isTranslating } = useTranslate();
  const [translation, setTranslation] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  useEffect(() => {
    handleTranslate();
  }, [content, sourceLanguage, targetLanguage]);

  const handleTranslate = async () => {
    if (!content || content.trim().length === 0) return;

    const result = await translateText(content, targetLanguage, sourceLanguage);

    if (result) {
      setTranslation(result);
      if (result.source !== sourceLanguage && sourceLanguage === 'auto') {
        setDetectedLanguage(result.source);
      }
    }
  };

  const languageNames = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    pl: 'Polski',
    ru: 'Русский',
    ja: '日本語',
    zh: '中文',
    ar: 'العربية',
    ko: '한국어'
  };

  return (
    <motion.div
      className="translated-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Original Content */}
      {showOriginal && (
        <div className="original-section">
          <div className="section-header">
            <span className="label">
              📝 Original
              {detectedLanguage && ` (${languageNames[detectedLanguage] || detectedLanguage})`}
            </span>
            {translation?.cached && <span className="cached-badge">⚡ Cached</span>}
          </div>
          <div className="content-box">
            <p>{content}</p>
          </div>
        </div>
      )}

      {/* Translated Content */}
      {translation && (
        <motion.div
          className="translated-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="section-header">
            <span className="label">
              🌍 Traducción ({languageNames[targetLanguage] || targetLanguage})
            </span>
            <span className="provider-badge">{translation.provider}</span>
          </div>
          <div className="content-box translated">
            <p>{translation.translations[targetLanguage]}</p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isTranslating && (
        <motion.div
          className="loading-state"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="loader">⟳</span>
          <span>Traduciendo...</span>
        </motion.div>
      )}

      {/* Language Selector */}
      <div className="language-control">
        <label htmlFor="target-lang">Traducir a:</label>
        <select
          id="target-lang"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="lang-select"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="pt">Português</option>
          <option value="pl">Polski</option>
          <option value="ru">Русский</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
          <option value="ar">العربية</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      {/* Quality Info */}
      {translation && (
        <div className="quality-info">
          <span className="confidence">
            Confianza: {Math.round(translation.confidence * 100)}%
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default TranslatedContent;
