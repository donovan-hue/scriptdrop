import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniApp } from '../../hooks/useMiniApp';
import MiniAppContainer from './MiniAppContainer';
import './miniapps.css';

const MiniAppDashboard = () => {
  const {
    instances,
    getActiveInstances,
    createInstance,
    loading
  } = useMiniApp();

  const [runningInstances, setRunningInstances] = useState([]);
  const [showMarketplace, setShowMarketplace] = useState(false);

  // Cargar instancias activas
  useEffect(() => {
    const loadInstances = async () => {
      const active = await getActiveInstances();
      setRunningInstances(active);
    };
    loadInstances();

    // Recargar cada 10 segundos
    const interval = setInterval(loadInstances, 10000);
    return () => clearInterval(interval);
  }, [getActiveInstances]);

  const handleInstanceClose = (instanceId) => {
    setRunningInstances(prev =>
      prev.filter(inst => inst.instanceId !== instanceId)
    );
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <motion.div
          className="header-content"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1>⚡ Mini-Apps Dashboard</h1>
          <p>Manage your active mini-applications</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="dashboard-stats"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card">
            <span className="stat-number">{runningInstances.length}</span>
            <span className="stat-label">Running</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{runningInstances.filter(i => i.status === 'running').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{runningInstances.filter(i => i.status === 'paused').length}</span>
            <span className="stat-label">Paused</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="quick-actions"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className="action-btn marketplace-btn"
          onClick={() => setShowMarketplace(!showMarketplace)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎮 Open Marketplace
        </motion.button>

        <motion.button
          className="action-btn refresh-btn"
          onClick={() => getActiveInstances()}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Refresh
        </motion.button>
      </motion.div>

      {/* Running Instances */}
      <motion.div
        className="instances-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Active Instances</h2>

        {loading ? (
          <div className="loading-state">Loading instances...</div>
        ) : runningInstances.length > 0 ? (
          <motion.div className="instances-list">
            <AnimatePresence>
              {runningInstances.map((instance, index) => (
                <motion.div
                  key={instance.instanceId}
                  className="instance-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="instance-icon" style={{ color: instance.miniApp?.color || '#00ff88' }}>
                    {instance.miniApp?.icon}
                  </div>

                  <div className="instance-info">
                    <h4 className="instance-name">{instance.miniApp?.name}</h4>
                    <p className="instance-status">
                      Status: <span className={`status-${instance.status}`}>● {instance.status}</span>
                    </p>
                  </div>

                  <div className="instance-size">
                    {instance.dimensions?.width} × {instance.dimensions?.height}
                  </div>

                  <div className="instance-actions">
                    <button
                      className="action-btn-sm focus-btn"
                      title="Focus Window"
                    >
                      ⬆
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="empty-icon">🎮</span>
            <p>No active mini-apps</p>
            <button
              className="action-btn marketplace-btn"
              onClick={() => setShowMarketplace(true)}
            >
              Launch your first app
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Marketplace Modal */}
      <AnimatePresence>
        {showMarketplace && (
          <motion.div
            className="marketplace-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                className="modal-close"
                onClick={() => setShowMarketplace(false)}
              >
                ✕
              </button>

              {/* Marketplace will be embedded here */}
              <div className="modal-body">
                <h2>Mini-Apps Marketplace</h2>
                <p>Select an app to launch...</p>
                {/* MiniAppMarketplace component will be plugged in here */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running Windows */}
      <div className="windows-layer">
        <AnimatePresence>
          {runningInstances.map((instance) => (
            <MiniAppContainer
              key={instance.instanceId}
              instance={instance}
              onClose={handleInstanceClose}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MiniAppDashboard;
