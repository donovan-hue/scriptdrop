import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './miniapps.css';

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('timer'); // 'timer' or 'stopwatch'
  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1 && mode === 'timer') {
            setIsRunning(false);
            playSound();
            return 0;
          }
          return prev + (mode === 'timer' ? -1 : 1);
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const playSound = () => {
    // Beep sound notification
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (mode === 'timer' && time === 0) {
      const totalSeconds = parseInt(inputMinutes) * 60 + parseInt(inputSeconds);
      setTime(totalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'timer') {
      setTime(0);
    } else {
      setTime(0);
    }
  };

  const handleSetMinutes = (e) => {
    const val = Math.min(parseInt(e.target.value) || 0, 59);
    setInputMinutes(String(val));
  };

  const handleSetSeconds = (e) => {
    const val = Math.min(parseInt(e.target.value) || 0, 59);
    setInputSeconds(String(val));
  };

  const percent = mode === 'timer'
    ? ((parseInt(inputMinutes) * 60 + parseInt(inputSeconds) - time) / (parseInt(inputMinutes) * 60 + parseInt(inputSeconds))) * 100
    : 0;

  return (
    <motion.div
      className="timer-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Audio Element for notification */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
      />

      {/* Mode Selector */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${mode === 'timer' ? 'active' : ''}`}
          onClick={() => {
            setMode('timer');
            setTime(0);
            setIsRunning(false);
          }}
        >
          ⏱ Timer
        </button>
        <button
          className={`mode-btn ${mode === 'stopwatch' ? 'active' : ''}`}
          onClick={() => {
            setMode('stopwatch');
            setTime(0);
            setIsRunning(false);
          }}
        >
          ⏱ Stopwatch
        </button>
      </div>

      {/* Display */}
      <motion.div
        className="timer-display"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <svg className="progress-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="progress-bg" />
          <circle
            cx="50"
            cy="50"
            r="45"
            className="progress-fill"
            style={{
              strokeDasharray: `${percent * 2.827} 282.7`,
              transform: 'rotate(-90deg)',
              transformOrigin: '50px 50px'
            }}
          />
        </svg>
        <div className="time-text">{formatTime(time)}</div>
      </motion.div>

      {/* Timer Setup (only show in timer mode and not running) */}
      {mode === 'timer' && time === 0 && !isRunning && (
        <motion.div
          className="timer-setup"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="input-group">
            <label>Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputMinutes}
              onChange={handleSetMinutes}
              disabled={isRunning}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Seconds</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={handleSetSeconds}
              disabled={isRunning}
              className="input-field"
            />
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="timer-controls">
        <motion.button
          className={`control-btn start-btn ${isRunning ? 'pause' : ''}`}
          onClick={handleStart}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </motion.button>

        <motion.button
          className="control-btn reset-btn"
          onClick={handleReset}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔄 Reset
        </motion.button>
      </div>

      {/* Quick Presets (for timer mode) */}
      {mode === 'timer' && (
        <div className="timer-presets">
          <button
            className="preset-btn"
            onClick={() => {
              setInputMinutes('1');
              setInputSeconds('0');
              setTime(0);
            }}
          >
            1m
          </button>
          <button
            className="preset-btn"
            onClick={() => {
              setInputMinutes('5');
              setInputSeconds('0');
              setTime(0);
            }}
          >
            5m
          </button>
          <button
            className="preset-btn"
            onClick={() => {
              setInputMinutes('10');
              setInputSeconds('0');
              setTime(0);
            }}
          >
            10m
          </button>
          <button
            className="preset-btn"
            onClick={() => {
              setInputMinutes('0');
              setInputSeconds('30');
              setTime(0);
            }}
          >
            30s
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Timer;
