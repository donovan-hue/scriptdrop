import React, { useEffect } from 'react';

const MainBubble = ({ onGetStarted, onExplore }) => {
  useEffect(() => {
    if (!document.getElementById('mainbubble-anim')) {
      const s = document.createElement('style');
      s.id = 'mainbubble-anim';
      s.textContent = `
        @keyframes floatHex {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-30px) rotate(5deg); }
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.glow} />

      {/* Hexágono con K */}
      <div style={styles.hexContainer}>
        <svg style={styles.svg} viewBox="0 0 200 230" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#7c3aed" />
              <stop offset="50%"  stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="hexGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <polygon
            points="100,20 180,60 180,140 100,180 20,140 20,60"
            fill="url(#hexGrad)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            filter="url(#hexGlow)"
            opacity="0.9"
          />
          <polygon
            points="100,35 165,70 165,130 100,165 35,130 35,70"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
        </svg>
        <div style={styles.kLetter}>K</div>
      </div>

      {/* Texto y botones */}
      <div style={styles.content}>
        <h1 style={styles.title}>KRONOS</h1>
        <p style={styles.subtitle}>
          Experience the future of social, shopping, and food delivery in one revolutionary platform
        </p>

        <div style={styles.buttons}>
          <button
            style={styles.btnPrimary}
            onClick={onGetStarted}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 0 30px rgba(124,58,237,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)';    e.currentTarget.style.boxShadow='0 0 20px rgba(124,58,237,0.4)'; }}
          >
            Get Started
          </button>
          <button
            style={styles.btnSecondary}
            onClick={onExplore}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#06b6d4'; e.currentTarget.style.color='#06b6d4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}
          >
            Explore Features
          </button>
        </div>

        <div style={styles.divider}>
          <span style={styles.line}/><span style={styles.orText}>or continue with</span><span style={styles.line}/>
        </div>

        <div style={styles.socialRow}>
          {['🍎','🔍','f'].map((ic, i) => (
            <button key={i} style={styles.socialBtn}>{ic}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    width: '100%', gap: '32px', padding: '40px 20px',
  },
  glow: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
    filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none',
  },
  hexContainer: {
    position: 'relative', width: '240px', height: '276px',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    animation: 'floatHex 4s ease-in-out infinite',
  },
  svg: {
    width: '100%', height: '100%',
    filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.5))',
  },
  kLetter: {
    position: 'absolute',
    fontSize: '90px', fontWeight: 900, color: '#fff',
    textShadow: '0 0 20px rgba(124,58,237,0.8)',
    zIndex: 10, lineHeight: 1,
    top: '50%', left: '50%',
    transform: 'translate(-50%, -58%)',
  },
  content: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', gap: '14px', width: '100%', maxWidth: '380px',
  },
  title: {
    margin: 0, fontSize: '34px', fontWeight: 900,
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '4px',
  },
  subtitle: {
    margin: 0, fontSize: '13px',
    color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
  },
  buttons: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' },
  btnPrimary: {
    padding: '13px', borderRadius: '24px',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: '#fff', border: 'none', fontSize: '15px', fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.3s',
    boxShadow: '0 0 20px rgba(124,58,237,0.4)',
  },
  btnSecondary: {
    padding: '12px', borderRadius: '24px', background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.3)',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
  },
  divider: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%' },
  line:   { flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' },
  orText: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' },
  socialRow: { display: 'flex', gap: '12px' },
  socialBtn: {
    width: '44px', height: '44px', borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff', fontSize: '18px', cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
};

export default MainBubble;
