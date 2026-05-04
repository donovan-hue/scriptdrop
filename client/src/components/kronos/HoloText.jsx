import React from 'react';

export default function HoloText({ children, size = 28, animate = false, style = {}, className = '' }) {
  return (
    <span
      className={`k-holo-text ${animate ? 'k-holo-animate' : ''} ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {children}
    </span>
  );
}
