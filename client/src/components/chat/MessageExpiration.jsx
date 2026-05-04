import React from 'react';

const MessageExpiration = ({ value, onChange }) => {
  const presets = [
    { label: '5 seconds', value: 5 },
    { label: '1 minute', value: 60 },
    { label: '5 minutes', value: 300 },
    { label: '1 hour', value: 3600 },
    { label: '24 hours', value: 86400 },
  ];

  const formatSeconds = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="message-expiration">
      <label>Message Expiration</label>
      <div className="expiration-presets">
        {presets.map((preset) => (
          <button
            key={preset.value}
            className={`expiration-preset ${value === preset.value ? 'active' : ''}`}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="expiration-display">
        <small>Messages will auto-delete after: {formatSeconds(value)}</small>
      </div>
    </div>
  );
};

export default MessageExpiration;
