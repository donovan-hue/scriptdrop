// Language Selector Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/TranslationContext';
import './translation.css';

const LanguageSelector = ({ compact = false }) => {
  const {
    currentLanguage,
    supportedLanguages,
    changeLanguage,
    translationProvider,
    setTranslationProvider,
    detectionEnabled,
    setDetectionEnabled
  } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = Object.entries(supportedLanguages).filter(([code, name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flagEmojis = {
    es: '🇪🇸',
    en: '🇬🇧',
    fr: '🇫🇷',
    de: '🇩🇪',
    it: '🇮🇹',
    pt: '🇵🇹',
    pl: '🇵🇱',
    ru: '🇷🇺',
    ja: '🇯🇵',
    zh: '🇨🇳',
    ar: '🇸🇦',
    ko: '🇰🇷'
  };

  return (
    <motion.div className="language-selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Main Button */}
      <motion.button
        className={`language-btn ${compact ? 'compact' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="flag">{flagEmojis[currentLanguage] || '🌐'}</span>
        <span className="lang-code">{currentLanguage.toUpperCase()}</span>
        {!compact && <span className="lang-name">{supportedLanguages[currentLanguage]}</span>}
        <motion.span
          className="dropdown-icon"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="language-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search */}
            <div className="dropdown-search">
              <input
                type="text"
                placeholder="Buscar idioma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            {/* Language List */}
            <div className="languages-list">
              {filteredLanguages.map(([code, name], idx) => (
                <motion.button
                  key={code}
                  className={`language-item ${currentLanguage === code ? 'active' : ''}`}
                  onClick={() => {
                    changeLanguage(code);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="item-flag">{flagEmojis[code] || '🌐'}</span>
                  <span className="item-name">{name}</span>
                  <span className="item-code">{code.toUpperCase()}</span>
                  {currentLanguage === code && <span className="checkmark">✓</span>}
                </motion.button>
              ))}
            </div>

            {/* Settings */}
            <div className="dropdown-settings">
              <button
                className={`setting-btn ${translationProvider === 'google' ? 'active' : ''}`}
                onClick={() => setTranslationProvider('google')}
                title="Google Translate"
              >
                🔵 Google
              </button>
              <button
                className={`setting-btn ${translationProvider === 'deepl' ? 'active' : ''}`}
                onClick={() => setTranslationProvider('deepl')}
                title="DeepL API"
              >
                🟠 DeepL
              </button>

              <label className="detection-toggle">
                <input
                  type="checkbox"
                  checked={detectionEnabled}
                  onChange={(e) => setDetectionEnabled(e.target.checked)}
                />
                <span>Auto-detectar idioma</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <motion.div
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default LanguageSelector;
