import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './miniapps.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEFAULT_CITIES = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris', 'Dubai'];

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('New York');
  const [inputValue, setInputValue] = useState('New York');
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const abortRef = useRef(null);

  const fetchWeather = async (city) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/miniapps/weather?city=${encodeURIComponent(city)}`,
        { signal: abortRef.current.signal }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setWeather(data);
      setIsMock(!!data.mock);
      setSearchCity(data.city || city);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'City not found');
    } finally {
      setLoading(false);
    }
  };

  // Load default city on mount
  useEffect(() => {
    fetchWeather('New York');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (city) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setInputValue(trimmed);
    fetchWeather(trimmed);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch(inputValue);
  };

  const handleQuickCity = (city) => {
    setInputValue(city);
    fetchWeather(city);
  };

  return (
    <motion.div
      className="weather-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="weather-header">
        <h2>🌍 Weather</h2>
        {isMock && (
          <span className="mock-badge" title="Using demo data — no API key configured">
            Demo data
          </span>
        )}
      </div>

      {/* Search */}
      <motion.div
        className="weather-search"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <input
          type="text"
          placeholder="Enter city name..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button
          className="search-btn"
          onClick={() => handleSearch(inputValue)}
        >
          🔍
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      {/* Weather Display */}
      {loading ? (
        <div className="loading-state">
          <div className="skeleton skeleton-icon" />
          <div className="skeleton skeleton-temp" />
          <div className="skeleton skeleton-desc" />
        </div>
      ) : weather ? (
        <motion.div
          className="weather-display"
          key={searchCity}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="city-name">{searchCity}</div>

          <motion.div
            className="weather-main"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="weather-icon">{weather.icon}</div>
            <div className="weather-temp">{weather.temperature}°F</div>
          </motion.div>

          <div className="weather-condition">{weather.condition || weather.description}</div>

          {/* Details */}
          <motion.div
            className="weather-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="detail-item">
              <span className="detail-label">💧 Humidity</span>
              <span className="detail-value">{weather.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💨 Wind</span>
              <span className="detail-value">{weather.windSpeed} mph</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      {/* Quick Cities */}
      <motion.div
        className="quick-cities"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="quick-label">Quick Access:</p>
        <div className="cities-grid">
          {DEFAULT_CITIES.map((city) => (
            <motion.button
              key={city}
              className={`city-btn ${searchCity === city ? 'active' : ''}`}
              onClick={() => handleQuickCity(city)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {city}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Forecast */}
      <motion.div
        className="weather-forecast"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3>5-Day Forecast</h3>
        <div className="forecast-items">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
            <div key={day} className="forecast-item">
              <span className="forecast-day">{day}</span>
              <span className="forecast-icon">
                {['☀️', '⛅', '🌧', '☁️', '🌞'][idx]}
              </span>
              <span className="forecast-temp">{65 + idx * 2}°</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Weather;
