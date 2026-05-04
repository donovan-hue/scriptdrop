import React from 'react';

export default function GlassCard({ children, padding = 16, style = {}, className = '', onClick }) {
  return (
    <div
      className={`k-glass ${className}`}
      style={{ padding, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
