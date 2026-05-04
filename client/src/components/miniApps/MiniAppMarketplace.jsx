import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniApp } from '../../hooks/useMiniApp';
import './miniapps.css';

const MiniAppMarketplace = () => {
  const {
    getAllApps,
    getMarketplace,
    getCategories,
    createInstance,
    loading
  } = useMiniApp();

  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filteredApps, setFilteredApps] = useState([]);
  const [installing, setInstalling] = useState(null);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, [getCategories]);

  // Cargar aplicaciones
  useEffect(() => {
    const loadApps = async () => {
      const result = await getMarketplace(selectedCategory, pagination.page, pagination.limit);
      if (result) {
        setApps(result.data || []);
        setPagination(result.pagination);
      }
    };
    loadApps();
  }, [selectedCategory, pagination.page, getMarketplace]);

  // Filtrar por búsqueda
  useEffect(() => {
    const filtered = apps.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApps(filtered);
  }, [searchTerm, apps]);

  const handleInstall = async (appId) => {
    setInstalling(appId);
    const result = await createInstance(appId);
    setInstalling(null);
    if (result) {
      alert(`✓ ${result.miniApp?.name} launched!`);
    }
  };

  const categoryColors = {
    productivity: '#00ff88',
    tools: '#0088ff',
    entertainment: '#ff00ff',
    utility: '#ffaa00',
    system: '#88ff00'
  };

  return (
    <motion.div
      className="marketplace-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="marketplace-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🎮 Mini-Apps Marketplace
        </motion.h1>
        <p>Discover and launch powerful mini-applications</p>
      </div>

      {/* Search Bar */}
      <motion.div
        className="marketplace-search"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <input
          type="text"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="category-filter"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('all');
            setPagination({ ...pagination, page: 1 });
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(cat.name);
              setPagination({ ...pagination, page: 1 });
            }}
            style={{
              borderColor: selectedCategory === cat.name ? categoryColors[cat.name] : 'rgba(0, 255, 136, 0.2)'
            }}
          >
            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
          </button>
        ))}
      </motion.div>

      {/* Apps Grid */}
      <motion.div
        className="apps-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {loading ? (
            <div className="loading-state">Loading applications...</div>
          ) : filteredApps.length > 0 ? (
            filteredApps.map((app, index) => (
              <motion.div
                key={app._id}
                className="app-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Card Background */}
                <div
                  className="app-card-bg"
                  style={{
                    backgroundColor: app.backgroundColor,
                    borderColor: app.color
                  }}
                />

                {/* Built-in Badge */}
                {app.isBuiltIn && (
                  <div className="builtin-badge">Built-in</div>
                )}

                {/* Icon */}
                <div className="app-icon" style={{ color: app.color }}>
                  {app.icon}
                </div>

                {/* Title & Description */}
                <h3 className="app-name">{app.name}</h3>
                <p className="app-description">{app.description}</p>

                {/* Metadata */}
                <div className="app-meta">
                  <span className="category-tag" style={{ color: categoryColors[app.category] }}>
                    {app.category}
                  </span>
                  <span className="version">v{app.version}</span>
                </div>

                {/* Stats */}
                <div className="app-stats">
                  <div className="stat">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">⭐ {app.stats?.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Users</span>
                    <span className="stat-value">{app.stats?.totalInstances || 0}</span>
                  </div>
                </div>

                {/* Launch Button */}
                <motion.button
                  className="launch-btn"
                  onClick={() => handleInstall(app._id)}
                  disabled={installing === app._id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    borderColor: app.color,
                    color: app.color
                  }}
                >
                  {installing === app._id ? (
                    <>
                      <span className="spinner">⟳</span> Launching...
                    </>
                  ) : (
                    <>
                      ▶ Launch
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))
          ) : (
            <div className="no-results">
              No applications found matching your criteria
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <motion.div
          className="pagination"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="page-btn"
          >
            ← Previous
          </button>

          <div className="page-info">
            Page {pagination.page} of {pagination.pages}
          </div>

          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="page-btn"
          >
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MiniAppMarketplace;
