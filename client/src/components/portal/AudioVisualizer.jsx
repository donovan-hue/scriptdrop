// Audio Visualizer Component - Sci-fi Effect
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AudioVisualizer = ({ theme = 'galaxy', intensity = 0.5 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let angle = 0;
    let particles = [];

    // Initialize particles based on theme
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(100 * intensity) || 50;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          frequency: Math.random() * 100 + 50
        });
      }
    };

    initParticles();

    const drawGalaxy = () => {
      // Clear canvas with semi-transparent background
      ctx.fillStyle = 'rgba(0, 5, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw spiral galaxy
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2 - i * 0.5;
        ctx.beginPath();

        for (let j = 0; j < Math.PI * 2; j += 0.1) {
          const r = (j + angle) * 50;
          const x = centerX + r * Math.cos(j);
          const y = centerY + r * Math.sin(j);

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      angle += 0.005;
    };

    const drawWaveform = () => {
      ctx.fillStyle = 'rgba(0, 5, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x += 10) {
        const wave = Math.sin((x * 0.01 + angle) * intensity * 5) * 50;
        const y = centerY + wave;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Draw second wave
      ctx.strokeStyle = 'rgba(255, 0, 136, 0.4)';
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x += 10) {
        const wave = Math.cos((x * 0.01 + angle + 1) * intensity * 5) * 30;
        const y = centerY - wave;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      angle += 0.02;
    };

    const drawParticles = () => {
      ctx.fillStyle = 'rgba(0, 5, 20, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.x += p.vx * intensity;
        p.y += p.vy * intensity;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.fillStyle = `rgba(0, 255, 136, ${p.opacity * intensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connection lines to nearby particles
        particles.forEach((other) => {
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.2 * (1 - distance / 100) * intensity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
    };

    const drawQuantum = () => {
      ctx.fillStyle = 'rgba(0, 5, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellSize = 30;
      const cols = Math.ceil(canvas.width / cellSize);
      const rows = Math.ceil(canvas.height / cellSize);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * cellSize + cellSize / 2;
          const y = j * cellSize + cellSize / 2;

          const value = Math.sin(i * 0.1 + angle) * Math.cos(j * 0.1 + angle) * intensity;

          ctx.fillStyle = `rgba(${Math.floor(255 * Math.abs(value))}, 0, ${Math.floor(255 * Math.abs(value))}, 0.5)`;
          ctx.fillRect(x - cellSize / 4, y - cellSize / 4, cellSize / 2, cellSize / 2);

          if (value > 0.5) {
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - cellSize / 3, y - cellSize / 3, (cellSize * 2) / 3, (cellSize * 2) / 3);
          }
        }
      }

      angle += 0.01;
    };

    const animate = () => {
      if (theme === 'waveform') {
        drawWaveform();
      } else if (theme === 'particles') {
        drawParticles();
      } else if (theme === 'quantum-field') {
        drawQuantum();
      } else {
        // Default galaxy
        drawGalaxy();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme, intensity]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="audio-visualizer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 1 }}
    />
  );
};

export default AudioVisualizer;
