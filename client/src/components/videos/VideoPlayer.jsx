import React, { useRef, useState } from 'react';

const containerStyle = {
  position: 'relative',
  width: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  background: '#000',
  boxShadow: '0 8px 32px rgba(31,38,135,0.37)',
};

const videoStyle = {
  width: '100%',
  maxHeight: '600px',
  display: 'block',
  objectFit: 'contain',
  background: '#000',
};

const overlayPlay = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  fontSize: '56px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  onPlay,
  onPause,
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);

  if (!src) return null;

  const handleToggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  return (
    <div style={containerStyle}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={controls}
        muted={muted}
        loop={loop}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        style={videoStyle}
        onPlay={() => { setPlaying(true); onPlay?.(); }}
        onPause={() => { setPlaying(false); onPause?.(); }}
      />
      {!playing && !controls && (
        <div style={overlayPlay} onClick={handleToggle}>▶</div>
      )}
    </div>
  );
}
