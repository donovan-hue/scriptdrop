import { useEffect, useRef, useState } from 'react';

export const useAudioVisualization = () => {
  const canvasRef = useRef(null);
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);

  // Inicializar Web Audio API
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const startVisualization = (audioStream) => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const audioContext = analyser.context;
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    setIsVisualizerActive(true);
    drawVisualization();
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser || !isVisualizerActive) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Limpiar canvas con gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(100, 200, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(200, 100, 255, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar barras de frecuencia (Galaxy effect)
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradiente RGB para efecto sci-fi
        const hue = (i / bufferLength * 360) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Glow effect
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 10;

        x += barWidth + 1;
      }
    };

    draw();
  };

  const stopVisualization = () => {
    setIsVisualizerActive(false);
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };

  return {
    canvasRef,
    isVisualizerActive,
    startVisualization,
    stopVisualization
  };
};
