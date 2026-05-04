import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './miniapps.css';

const Translator = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi'
  };

  const translateText = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Using Google Translate API (free alternative)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`
      );

      const data = await response.json();

      if (data.responseStatus === 200) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setError('Translation failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      translateText();
    }
  };

  return (
    <motion.div
      className="translator-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="translator-container">
        {/* Header */}
        <motion.div
          className="translator-header"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2>🌐 Translator</h2>
          <p>Translate text between languages</p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          className="language-selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="lang-group">
            <label>From</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="lang-select"
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            className="swap-btn"
            onClick={swapLanguages}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            title="Swap languages"
          >
            ⇄
          </motion.button>

          <div className="lang-group">
            <label>To</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="lang-select"
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            ⚠ {error}
          </motion.div>
        )}

        {/* Text Areas */}
        <motion.div
          className="text-areas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Source Text */}
          <div className="text-group">
            <label>Source Text</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-area"
              placeholder="Enter text to translate..."
            />
            <div className="text-footer">
              <span className="char-count">{sourceText.length} characters</span>
              {sourceText && (
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(sourceText)}
                  title="Copy source text"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          {/* Translated Text */}
          <div className="text-group">
            <label>Translated Text</label>
            <textarea
              value={translatedText}
              readOnly
              className="text-area"
              placeholder="Translation will appear here..."
            />
            <div className="text-footer">
              <span className="char-count">{translatedText.length} characters</span>
              {translatedText && (
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(translatedText)}
                  title="Copy translated text"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Translate Button */}
        <motion.button
          className="translate-btn"
          onClick={translateText}
          disabled={loading || !sourceText.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <>
              <span className="spinner">⟳</span> Translating...
            </>
          ) : (
            <>
              ✨ Translate
            </>
          )}
        </motion.button>

        {/* Tips */}
        <motion.div
          className="translator-tips"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <small>💡 Tip: Press Ctrl+Enter to translate</small>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Translator;
