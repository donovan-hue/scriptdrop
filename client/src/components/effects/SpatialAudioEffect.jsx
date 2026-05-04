// Spatial Audio Effect Component
import React from 'react';
import { motion } from 'framer-motion';

const SpatialAudioEffect = ({ users = [] }) => {
  return (
    <motion.div
      className="spatial-audio-effect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* 3D Space Grid */}
      <div className="space-grid">
        {/* Vertical lines */}
        {[...Array(11)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="grid-line vertical"
            style={{ left: `${i * 10}%` }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{
              duration: 4,
              delay: i * 0.1,
              repeat: Infinity
            }}
          />
        ))}

        {/* Horizontal lines */}
        {[...Array(11)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="grid-line horizontal"
            style={{ top: `${i * 10}%` }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{
              duration: 4,
              delay: i * 0.1 + 0.05,
              repeat: Infinity
            }}
          />
        ))}
      </div>

      {/* 3D Coordinates System */}
      <svg className="coordinate-system" viewBox="0 0 500 500">
        {/* X Axis */}
        <line x1="250" y1="250" x2="450" y2="250" stroke="#00FF88" strokeWidth="2" opacity="0.6" />
        <text x="460" y="255" fill="#00FF88" fontSize="14">X</text>

        {/* Y Axis */}
        <line x1="250" y1="250" x2="250" y2="50" stroke="#0088FF" strokeWidth="2" opacity="0.6" />
        <text x="255" y="40" fill="#0088FF" fontSize="14">Y</text>

        {/* Z Axis */}
        <line x1="250" y1="250" x2="350" y2="350" stroke="#FF0088" strokeWidth="2" opacity="0.6" />
        <text x="360" y="360" fill="#FF0088" fontSize="14">Z</text>

        {/* User Positions */}
        {users.map((user, idx) => {
          const baseX = 250;
          const baseY = 250;
          const scale = 50;

          const x = baseX + (user.spatial?.x || 0) * scale;
          const y = baseY - (user.spatial?.y || 0) * scale;

          return (
            <g key={user._id}>
              {/* User Indicator */}
              <motion.circle
                cx={x}
                cy={y}
                r="6"
                fill={user.color || '#00FF88'}
                opacity="0.8"
                animate={{
                  r: [6, 8, 6],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />

              {/* User Label */}
              <text
                x={x}
                y={y - 15}
                fill={user.color || '#00FF88'}
                fontSize="12"
                textAnchor="middle"
              >
                {user.username?.substring(0, 8)}
              </text>

              {/* Mute Indicator */}
              {user.isMuted && (
                <text
                  x={x}
                  y={y + 20}
                  fill="#FF4444"
                  fontSize="10"
                  textAnchor="middle"
                >
                  🤐
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Distance Indicators */}
      <div className="distance-info">
        <h4>Información Espacial 3D</h4>
        {users.length > 0 ? (
          <ul className="distance-list">
            {users.map((user, idx) => {
              const distance = Math.sqrt(
                (user.spatial?.x || 0) ** 2 +
                (user.spatial?.y || 0) ** 2 +
                (user.spatial?.z || 0) ** 2
              ).toFixed(2);

              return (
                <motion.li
                  key={user._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <span className="user-indicator" style={{ background: user.color }}>
                    {user.username.charAt(0)}
                  </span>
                  <span className="user-name">{user.username}</span>
                  <span className="distance-value">
                    {distance} metros
                  </span>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <p className="no-users">Solo en la sala</p>
        )}
      </div>
    </motion.div>
  );
};

export default SpatialAudioEffect;
