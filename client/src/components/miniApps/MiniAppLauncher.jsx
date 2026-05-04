import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniApp } from '../../hooks/useMiniApp';
import './miniapps.css';

const MiniAppLauncher = ({ onAppLaunched }) => {
  const {
    getAllApps,
    getMarketplace,
    createInstance,
    loading
  } = useMiniApp();

  const [apps, setApps] = useState([]);
  const [showLauncher, setShowLauncher] = useState(false);
  const [recentApps, setRecentApps] = useState([]);
  const [launching, setLaunching] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApps, setFilteredApps] = useState([]);

  // Load recent apps from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentMiniApps') || '[]');
    setRecentApps(recent.slice(0, 5));
  }, []);

  // Load all apps for search
  useEffect(() => {
    const loadApps = async () => {
      const result = await getMarketplace('all', 1, 100);
      if (result) {
        setApps(result.data || []);
      }
    };
    loadApps();
  }, [getMarketplace]);

  // Filter apps by search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = apps.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApps(filtered);
    } else {
      setFilteredApps([]);
    }
  }, [searchTerm, apps]);

  const handleLaunch = async (app) => {
    setLaunching(app._id);
    try {
      const result = await createInstance(app.appId);
      if (result) {
        // Save to recent apps
        const recent = JSON.parse(localStorage.getItem('recentMiniApps') || '[]');
        const updated = [app.appId, ...recent.filter(a => a !== app.appId)].slice(0, 5);
        localStorage.setItem('recentMiniApps', JSON.stringify(updated));

        setShowLauncher(false);
        setSearchTerm('');
        onAppLaunched?.(result);
      }
    } finally {
      setLaunching(null);
    }
  };

  const handleQuickLaunch = async (appId) => {
    const app = apps.find(a => a.appId === appId);
    if (app) {
      handleLaunch(app);
    }
  };

  return (
    <motion.div
      className="mini-app-launcher"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Toggle Button */}
      <motion.button
        className="launcher-toggle"
        onClick={() => setShowLauncher(!showLauncher)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Launch Mini-App"
      >
        🚀
      </motion.button>

      {/* Quick Launch Bar (Recent Apps) */}
      {!showLauncher && recentApps.length > 0 && (
        <motion.div
          className="quick-launch-bar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <span className="quick-label">Recent:</span>
          <div className="quick-apps">
            {recentApps.map((appId) => {
              const app = apps.find(a => a.appId === appId);
              return app ? (
                <motion.button
                  key={appId}
                  className="quick-app-btn"
                  onClick={() => handleQuickLaunch(appId)}
                  disabled={launching === app._id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={app.name}
                >
                  {app.icon}
                </motion.button>
              ) : null;
            })}
          </div>
        </motion.div>
      )}

      {/* Launcher Panel */}
      <AnimatePresence>
        {showLauncher && (
          <motion.div
            className="launcher-panel"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="launcher-header">
              <h3>Quick Launcher</h3>
              <button
                className="close-btn"
                onClick={() => setShowLauncher(false)}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="launcher-search">
              <input
                type="text"
                placeholder="Search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="launcher-input"
              />
            </div>

            {/* App List */}
            <div className="launcher-list">
              {loading ? (
                <div className="launcher-loading">Loading...</div>
              ) : filteredApps.length > 0 ? (
                <AnimatePresence>
                  {filteredApps.map((app, index) => (
                    <motion.button
                      key={app._id}
                      className="launcher-app-item"
                      onClick={() => handleLaunch(app)}
                      disabled={launching === app._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="app-icon" style={{ color: app.color }}>
                        {app.icon}
                      </span>
                      <div className="app-details">
                        <span className="app-name">{app.name}</span>
                        <span className="app-desc">{app.description}</span>
                      </div>
                      {launching === app._id ? (
                        <span className="spinner">⟳</span>
                      ) : (
                        <span className="launcher-arrow">→</span>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              ) : searchTerm ? (
                <div className="no-results">No apps found</div>
              ) : (
                <div className="launcher-hint">Type to search apps</div>
              )}
            </div>

            {/* Footer Stats */}
            <div className="launcher-footer">
              <span>{apps.length} apps available</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {showLauncher && (
          <motion.div
            className="launcher-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLauncher(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MiniAppLauncher;
