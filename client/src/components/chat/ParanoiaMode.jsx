import React, { useState } from 'react';

const ParanoiaMode = ({ enabled, onChange }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  const features = [
    { icon: '🎭', name: 'Decoy Messages', description: 'Inject fake messages to confuse analytics' },
    { icon: '👻', name: 'Ghost Mode', description: 'Hide read receipts and timestamps' },
    { icon: '📸', name: 'Screenshot Guard', description: 'Warn on screenshot attempts' },
    { icon: '🔄', name: 'Key Rotation', description: 'Auto-rotate encryption keys per session' },
    { icon: '⏱️', name: 'Session Timeout', description: 'Auto-logout after 15 minutes' },
    { icon: '🌑', name: 'Stealth UI', description: 'Minimal dark mode interface' },
  ];

  return (
    <div className="paranoia-mode">
      <div className="paranoia-toggle">
        <input
          type="checkbox"
          id="paranoia-checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="paranoia-input"
        />
        <label htmlFor="paranoia-checkbox" className="paranoia-label">
          <span className="paranoia-icon">⚙️</span>
          Paranoia Mode
        </label>
      </div>

      <button
        className="paranoia-info-btn"
        onClick={() => setShowFeatures(!showFeatures)}
        title="View paranoia features"
      >
        ?
      </button>

      {showFeatures && (
        <div className="paranoia-features-modal">
          <div className="paranoia-features-content">
            <h3>Paranoia Mode Features</h3>
            <div className="paranoia-features-grid">
              {features.map((feature, idx) => (
                <div key={idx} className="paranoia-feature-card">
                  <span className="feature-icon">{feature.icon}</span>
                  <h4>{feature.name}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
            <button
              className="paranoia-features-close"
              onClick={() => setShowFeatures(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParanoiaMode;
