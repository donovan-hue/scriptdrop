// Translation Toggle Component - Show/Hide translations
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslate } from '../../hooks/useTranslate';
import './translation.css';

const TranslationToggle = ({ content, sourceLanguage = 'auto' }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const { translateText, isTranslating } = useTranslate();

  const handleToggleTranslation = async () => {
    if (!showTranslation && !translation) {
      // Fetch translation when toggling on for first time
      const result = await translateText(content, targetLanguage, sourceLanguage);
      if (result) {
        setTranslation(result);
      }
    }
    setShowTranslation(!showTranslation);
  };

  const handleChangeLanguage = async (newLang) => {
    setTargetLanguage(newLang);

    if (showTranslation) {
      // Re-translate with new language
      const result = await translateText(content, newLang, sourceLanguage);
      if (result) {
        setTranslation(result);
      }
    }
  };

  return (
    <motion.div className="translation-toggle">
      {/* Toggle Button */}
      <motion.button
        className={`toggle-btn ${showTranslation ? 'active' : ''}`}
        onClick={handleToggleTranslation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="icon">🌐</span>
        <span className="text">
          {showTranslation ? 'Ocultar traducción' : 'Ver traducción'}
        </span>
      </motion.button>

      {/* Expanded Translation */}
      {showTranslation && (
        <motion.div
          className="translation-expanded"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Language Selector */}
          <div className="translation-language-select">
            <label>Idioma:</label>
            <select value={targetLanguage} onChange={(e) => handleChangeLanguage(e.target.value)}>
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="ko">🇰🇷 한국어</option>
            </select>
          </div>

          {/* Translation Content */}
          {isTranslating ? (
            <motion.div
              className="translating"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="spinner">✧</span> Traduciendo...
            </motion.div>
          ) : translation ? (
            <motion.div
              className="translation-result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>{translation.translations[targetLanguage]}</p>
              <span className="translation-meta">
                {translation.provider} • {Math.round(translation.confidence * 100)}%
              </span>
            </motion.div>
          ) : null}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TranslationToggle;
