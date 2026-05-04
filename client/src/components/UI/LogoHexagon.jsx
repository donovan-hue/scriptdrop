import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const HexagonContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const HexagonSVG = styled.svg`
  filter: drop-shadow(0 8px 24px rgba(255, 110, 199, 0.2));
  transition: all 0.3s ease;
  
  &:hover {
    filter: drop-shadow(0 0 30px rgba(255, 110, 199, 0.4)),
            drop-shadow(0 0 20px rgba(0, 212, 255, 0.3)),
            drop-shadow(0 8px 24px rgba(31, 38, 135, 0.15));
  }
`;

const TextInside = styled.text`
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 32px;
  fill: url(#gradient);
  text-anchor: middle;
  dominant-baseline: middle;
`;

const LogoHexagon = ({ size = 120, animate = true }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <HexagonContainer
      variants={containerVariants}
      initial="hidden"
      animate={animate ? ['visible', 'animate'] : 'visible'}
      variants={animate ? { ...containerVariants, animate: floatVariants } : containerVariants}
    >
      <HexagonSVG
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ cursor: 'pointer' }}
      >
        <defs>
          <linearGradient
            id="gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: '#ff6ec7', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#b344ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00d4ff', stopOpacity: 1 }} />
          </linearGradient>
          
          <linearGradient
            id="hexGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: 'rgba(255, 110, 199, 0.1)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(0, 212, 255, 0.1)', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Hexagon Background */}
        <polygon
          points={`
            ${size / 2},${size * 0.1}
            ${size * 0.85},${size * 0.35}
            ${size * 0.85},${size * 0.75}
            ${size / 2},${size * 0.9}
            ${size * 0.15},${size * 0.75}
            ${size * 0.15},${size * 0.35}
          `}
          fill="url(#hexGradient)"
          stroke="url(#gradient)"
          strokeWidth="2"
          filter="url(#glow)"
          style={{
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Inner Hexagon Border (Iridescent) */}
        <polygon
          points={`
            ${size / 2},${size * 0.15}
            ${size * 0.80},${size * 0.35}
            ${size * 0.80},${size * 0.75}
            ${size / 2},${size * 0.85}
            ${size * 0.20},${size * 0.75}
            ${size * 0.20},${size * 0.35}
          `}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Text */}
        <TextInside x={size / 2} y={size / 2}>
          S
        </TextInside>
      </HexagonSVG>
    </HexagonContainer>
  );
};

export default LogoHexagon;
