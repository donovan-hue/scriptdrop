// useSpatialAudio Hook - Spatial Audio Processing
import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpatialAudio = () => {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequency, setFrequency] = useState(440);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyzerRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const pannerRef = useRef(null);
  const dataArrayRef = useRef(null);

  // Initialize Web Audio API
  const initAudio = useCallback(async () => {
    try {
      // Check browser support
      const audioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) {
        throw new Error('Web Audio API not supported');
      }

      audioContextRef.current = new audioContext();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      streamRef.current = stream;

      // Create audio graph
      const source = audioContextRef.current.createMediaStreamAudioSource(stream);
      const analyzerNode = audioContextRef.current.createAnalyser();
      analyzerNode.fftSize = 256;

      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0.5;

      const pannerNode = audioContextRef.current.createStereoPanner();

      // Create oscillator for test tone (optional)
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Connect nodes
      source.connect(analyzerNode);
      analyzerNode.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(audioContextRef.current.destination);

      // Store references
      analyzerRef.current = analyzerNode;
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      pannerRef.current = pannerNode;

      // Storage for frequency data
      dataArrayRef.current = new Uint8Array(analyzerNode.frequencyBinCount);

      setIsAudioInitialized(true);
      setError(null);

      console.log('✓ Audio initialized successfully');

      // Start monitoring audio level
      monitorAudioLevel();

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to initialize audio';
      setError(errorMessage);
      console.error('Audio initialization error:', err);
      throw err;
    }
  }, [frequency]);

  // Monitor microphone level
  const monitorAudioLevel = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return;

    const updateLevel = () => {
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

      // Calculate average level
      const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
      setAudioLevel(Math.round(average));

      requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  // Set spatial position (pan)
  const setSpatialPosition = useCallback((x, y, z) => {
    if (!pannerRef.current || !audioContextRef.current) return;

    try {
      // Pan left-right based on X
      const panValue = Math.max(-1, Math.min(1, x));
      pannerRef.current.pan.value = panValue;

      console.log(`Spatial position set: X=${x}, Y=${y}, Z=${z}`);
    } catch (err) {
      console.error('Error setting spatial position:', err);
    }
  }, []);

  // Set audio frequency
  const setAudioFrequency = useCallback((freq) => {
    if (!oscillatorRef.current) return;

    try {
      oscillatorRef.current.frequency.value = freq;
      setFrequency(freq);
    } catch (err) {
      console.error('Error setting frequency:', err);
    }
  }, []);

  // Set gain/volume
  const setGain = useCallback((value) => {
    if (!gainNodeRef.current) return;

    try {
      const clampedValue = Math.max(0, Math.min(1, value / 100));
      gainNodeRef.current.gain.value = clampedValue;
    } catch (err) {
      console.error('Error setting gain:', err);
    }
  }, []);

  // Get audio data for visualization
  const getAudioData = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return null;

    analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
    return new Uint8Array(dataArrayRef.current);
  }, []);

  // Stop audio and cleanup
  const stopAudio = useCallback(() => {
    try {
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      setIsAudioInitialized(false);
      console.log('✓ Audio stopped');
    } catch (err) {
      console.error('Error stopping audio:', err);
    }
  }, []);

  // Create spatial audio pan with distance modeling
  const createSpatialPan = useCallback((userPosition, listenerPosition = { x: 0, y: 0, z: 0 }) => {
    try {
      // Calculate distance
      const dx = userPosition.x - listenerPosition.x;
      const dy = userPosition.y - listenerPosition.y;
      const dz = userPosition.z - listenerPosition.z;

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Calculate pan (-1 to 1)
      const panValue = dx > 0 ? Math.min(1, dx / 10) : Math.max(-1, dx / 10);

      // Calculate volume reduction based on distance
      const volumeReduction = Math.max(0, 1 - distance / 20);

      return {
        pan: panValue,
        volume: volumeReduction,
        distance: distance.toFixed(2)
      };
    } catch (err) {
      console.error('Error creating spatial pan:', err);
      return { pan: 0, volume: 1, distance: 0 };
    }
  }, []);

  // Detect speech activity
  const detectSpeechActivity = useCallback(() => {
    if (audioLevel > 30) return true;
    return false;
  }, [audioLevel]);

  return {
    isAudioInitialized,
    audioLevel,
    frequency,
    error,
    initAudio,
    stopAudio,
    setSpatialPosition,
    setAudioFrequency,
    setGain,
    getAudioData,
    createSpatialPan,
    detectSpeechActivity,
    audioContext: audioContextRef.current
  };
};
