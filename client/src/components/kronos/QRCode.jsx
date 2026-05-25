import React from 'react';

// Simple QR placeholder — shows the value as text with a visual frame
// No external dependency needed
export default function QRCode({ value, size = 180, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background: '#ffffff',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid #0a0a14',
        position: 'relative',
        padding: 8,
        boxSizing: 'border-box',
      }}
    >
      {/* Corner marks */}
      {[['0','0'],['0','auto'],['auto','0'],['auto','auto']].map(([t,b], i) => (
        <div key={i} style={{
          position: 'absolute',
          top: t === '0' ? 6 : undefined,
          bottom: b === '0' ? 6 : undefined,
          left: i % 2 === 0 ? 6 : undefined,
          right: i % 2 === 1 ? 6 : undefined,
          width: 18, height: 18,
          border: '3px solid #0a0a14',
          borderRadius: 3,
        }} />
      ))}
      {/* Grid pattern */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
        width: size * 0.55,
        height: size * 0.55,
      }}>
        {Array.from({ length: 49 }, (_, i) => {
          const row = Math.floor(i / 7);
          const col = i % 7;
          const isCorner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
          const hash = (value.charCodeAt(i % value.length) + i * 7 + row * 3) % 3;
          const filled = isCorner || hash === 0;
          return (
            <div key={i} style={{
              width: '100%',
              aspectRatio: '1',
              background: filled ? '#0a0a14' : 'transparent',
              borderRadius: 1,
            }} />
          );
        })}
      </div>
      <div style={{
        fontSize: Math.max(8, size * 0.06),
        color: '#0a0a14',
        marginTop: 6,
        textAlign: 'center',
        maxWidth: size - 20,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
      }}>
        {value?.slice(0, 16)}
      </div>
    </div>
  );
}
