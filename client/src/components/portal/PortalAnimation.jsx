// Portal Animation Effect Component
import React from 'react';
import { motion } from 'framer-motion';

const PortalAnimation = ({ theme = 'kronos-sci-fi', isActive }) => {
  const portalVariants = {
    initial: { scale: 0, opacity: 0, rotate: 0 },
    animate: {
      scale: 1,
      opacity: [0.3, 0.6, 0.3],
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear'
      }
    },
    exit: { scale: 0, opacity: 0 }
  };

  const energyPulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 0.4, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'cosmic':
        return { primary: '#FF00FF', secondary: '#00FFFF' };
      case 'nebula':
        return { primary: '#FF1493', secondary: '#00FF7F' };
      case 'quantum':
        return { primary: '#FF00FF', secondary: '#FFFF00' };
      case 'portal':
        return { primary: '#00FFFF', secondary: '#FF00FF' };
      default: // kronos-sci-fi
        return { primary: '#00FF88', secondary: '#0088FF' };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div
      className="portal-animation-container"
      initial="initial"
      animate={isActive ? 'animate' : 'initial'}
      exit="exit"
    >
      {/* Outer Portal Ring */}
      <motion.svg
        className="portal-ring outer"
        viewBox="0 0 200 200"
        variants={portalVariants}
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          opacity="0.8"
        />
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="1"
          opacity="0.4"
        />
      </motion.svg>

      {/* Middle Portal Ring */}
      <motion.svg
        className="portal-ring middle"
        viewBox="0 0 200 200"
        animate={{
          rotate: -360,
          transition: {
            duration: 15,
            repeat: Infinity,
            ease: 'linear'
          }
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="2"
          opacity="0.6"
        />
        <circle
          cx="100"
          cy="100"
          r="65"
          fill="none"
          stroke={colors.primary}
          strokeWidth="1"
          opacity="0.3"
        />
      </motion.svg>

      {/* Inner Portal Ring */}
      <motion.svg
        className="portal-ring inner"
        viewBox="0 0 200 200"
        animate={{
          rotate: 360,
          transition: {
            duration: 10,
            repeat: Infinity,
            ease: 'linear'
          }
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          opacity="0.7"
        />
      </motion.svg>

      {/* Energy Pulses */}
      {[0, 120, 240].map((angle) => (
        <motion.div
          key={angle}
          className="energy-pulse"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transformOrigin: '0 0',
            rotate: angle
          }}
          variants={energyPulseVariants}
          animate="animate"
        >
          <div
            style={{
              width: '2px',
              height: '100px',
              background: `linear-gradient(to bottom, ${colors.primary}, transparent)`,
              filter: 'blur(1px)'
            }}
          />
        </motion.div>
      ))}

      {/* Center Light */}
      <motion.div
        className="center-light"
        animate={{
          boxShadow: [
            `0 0 30px ${colors.primary}`,
            `0 0 60px ${colors.primary}`,
            `0 0 30px ${colors.primary}`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: colors.secondary,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.8
        }}
      />

      {/* Portal Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          animate={{
            x: Math.cos((i / 12) * Math.PI * 2) * 80,
            y: Math.sin((i / 12) * Math.PI * 2) * 80,
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: (i / 12) * 0.3
          }}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: colors.primary,
            borderRadius: '50%',
            filter: 'blur(0.5px)',
            top: '50%',
            left: '50%'
          }}
        />
      ))}

      {/* Glow Effect */}
      <motion.div
        className="portal-glow"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.9, 1.1, 0.9]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${colors.primary}33 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(20px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </motion.div>
  );
};

export default PortalAnimation;
