import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useMiniApp } from '../../hooks/useMiniApp';
import './miniapps.css';

// ── Dynamic mini-app registry ──────────────────────────────────────────────
// Add new mini-apps here: key = appId / componentPath slug used in the DB
const MINI_APPS = {
  weather:    lazy(() => import('./Weather')),
  stock:      lazy(() => import('./Stock')),
  stocks:     lazy(() => import('./Stock')),   // alias
  calculator: lazy(() => import('./Calculator')),
  notes:      lazy(() => import('./Notes')),
  timer:      lazy(() => import('./Timer')),
  translator: lazy(() => import('./Translator')),
};

// Normalise the id stored in app.routes.componentPath or app.id
const resolveAppKey = (app) => {
  if (!app) return null;
  const raw =
    app.routes?.componentPath ||  // e.g. "./Weather" or "Weather"
    app.id ||
    app.type ||
    app.slug ||
    '';
  return raw.replace(/^\.?\/?/, '').replace(/\.jsx?$/, '').toLowerCase();
};

const MiniAppContainer = ({ instance, onClose }) => {
  const { updateInstanceStatus, closeInstance, saveInstanceData } = useMiniApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: instance?.position?.x || 50, y: instance?.position?.y || 50 });
  const [size, setSize] = useState({
    width: instance?.dimensions?.width || 500,
    height: instance?.dimensions?.height || 400
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const startResizeRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Render the correct component dynamically
  const renderAppComponent = () => {
    const app = instance?.miniApp;
    if (!app) return null;

    const key = resolveAppKey(app);
    const AppComponent = key ? MINI_APPS[key] : null;

    if (!AppComponent) {
      return (
        <div className="app-placeholder">
          <div className="app-placeholder-icon">{app.icon}</div>
          <h3>{app.name}</h3>
          <p>{app.description}</p>
          <div className="placeholder-instructions">
            Mini-app no disponible
          </div>
        </div>
      );
    }

    return (
      <Suspense
        fallback={
          <div className="loading-state">
            <span>{app.icon || '⏳'}</span> Loading {app.name}…
          </div>
        }
      >
        <AppComponent />
      </Suspense>
    );
  };

  const handleDragStart = (e) => {
    if (e.target.closest('.window-btn')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    startResizeRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - startResizeRef.current.x;
    const deltaY = e.clientY - startResizeRef.current.y;

    setSize({
      width: Math.max(instance?.miniApp?.config?.minWidth || 300, startResizeRef.current.width + deltaX),
      height: Math.max(instance?.miniApp?.config?.minHeight || 250, startResizeRef.current.height + deltaY)
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  const handleClose = async () => {
    await closeInstance(instance.instanceId);
    onClose(instance.instanceId);
  };

  const handleMinimize = () => {
    updateInstanceStatus(instance.instanceId, 'paused');
  };

  const handleMaximize = () => {
    setSize({
      width: window.innerWidth - 40,
      height: window.innerHeight - 100
    });
    setPosition({ x: 20, y: 80 });
  };

  const app = instance?.miniApp;
  const appColor = app?.color || '#00ff88';

  return (
    <motion.div
      ref={containerRef}
      className="mini-app-container"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        borderColor: appColor
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ boxShadow: `0 0 30px ${appColor}40` }}
    >
      {/* Window Header */}
      <div
        className="window-header"
        onMouseDown={handleDragStart}
        style={{ backgroundColor: `${appColor}15` }}
      >
        {/* Icon */}
        <span className="window-icon" style={{ color: appColor }}>
          {app?.icon}
        </span>

        {/* Title */}
        <h3 className="window-title">{app?.name}</h3>

        {/* Control Buttons */}
        <div className="window-controls">
          <button
            className="window-btn minimize-btn"
            onClick={handleMinimize}
            title="Minimize"
          >
            _
          </button>
          <button
            className="window-btn maximize-btn"
            onClick={handleMaximize}
            title="Maximize"
          >
            □
          </button>
          <button
            className="window-btn close-btn"
            onClick={handleClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content">
        {renderAppComponent()}
      </div>

      {/* Resize Handle */}
      {instance?.miniApp?.config?.resizable !== false && (
        <div
          className="resize-handle"
          onMouseDown={handleResizeStart}
          style={{ borderColor: appColor }}
        />
      )}

      {/* Status Bar */}
      <div className="window-statusbar">
        <span className="status-text">
          {instance?.status === 'running' ? '● Running' : '● ' + instance?.status}
        </span>
        <span className="status-info">
          {size.width} × {size.height}
        </span>
      </div>
    </motion.div>
  );
};

export default MiniAppContainer;
