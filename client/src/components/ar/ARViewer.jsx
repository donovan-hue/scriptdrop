import React, { useEffect, useState } from 'react';
import { useAR } from '../../hooks/useAR';
import './ARViewer.css';

const ARViewer = ({ productId }) => {
  const {
    loading,
    error,
    session,
    arProduct,
    videoRef,
    canvasRef,
    getARProduct,
    startSession,
    endSession,
    captureScreenshot,
    accessCamera
  } = useAR();

  const [isActive, setIsActive] = useState(false);
  const [showMenu, setShowMenu] = useState(true);

  useEffect(() => {
    getARProduct(productId);
  }, [productId, getARProduct]);

  const handleStart = async () => {
    const deviceInfo = {
      osType: navigator.platform,
      cameraResolution: '1080p',
      supportedFeatures: ['pose-detection', 'physics']
    };

    const newSession = await startSession(productId, deviceInfo);
    if (newSession) {
      setIsActive(true);
      setShowMenu(false);
      await accessCamera();
    }
  };

  const handleCapture = async () => {
    if (session) {
      await captureScreenshot(session._id);
    }
  };

  const handleEnd = async () => {
    if (session) {
      await endSession(session._id);
      setIsActive(false);
      setShowMenu(true);
    }
  };

  return (
    <div className="ar-viewer">
      {error && <div className="ar-error">{error}</div>}

      <video
        ref={videoRef}
        className={`ar-video ${isActive ? 'active' : 'inactive'}`}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="ar-canvas"
        style={{ display: 'none' }}
      />

      {showMenu && (
        <div className="ar-menu">
          <div className="ar-info">
            <h3>Virtual Try-On</h3>
            <p>See how this product looks on you before buying</p>
          </div>
          <button
            className="ar-start-btn"
            onClick={handleStart}
            disabled={loading || !arProduct}
          >
            {loading ? 'Loading...' : 'Start AR Try-On'}
          </button>
        </div>
      )}

      {isActive && (
        <div className="ar-controls">
          <button className="ar-capture-btn" onClick={handleCapture} title="Capture">
            📸
          </button>
          <button className="ar-rotate-btn" title="Rotate Product">
            🔄
          </button>
          <button className="ar-zoom-btn" title="Zoom">
            🔍
          </button>
          <button className="ar-end-btn" onClick={handleEnd} title="Exit">
            ✕
          </button>
        </div>
      )}

      <div className="ar-instructions">
        {isActive ? (
          <p>Move your device to position the product. Tap 📸 to capture.</p>
        ) : (
          <p>Tap "Start AR Try-On" to begin</p>
        )}
      </div>
    </div>
  );
};

export default ARViewer;
