import React from 'react';

const EncryptionStatus = ({ fingerprint }) => {
  return (
    <div className="encryption-status">
      <div className="encryption-status-indicator">
        <span className="encryption-lock">🔒</span>
        <span className="encryption-label">E2EE Active</span>
      </div>
      {fingerprint && (
        <div className="encryption-details">
          <small>Fingerprint: {fingerprint}</small>
        </div>
      )}
    </div>
  );
};

export default EncryptionStatus;
