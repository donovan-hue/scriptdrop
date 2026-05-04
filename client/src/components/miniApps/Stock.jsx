import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './miniapps.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA'];
const REFRESH_INTERVAL_MS = 60 * 1000; // 60 seconds

const Stock = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchStocks = async (showFullLoading = false) => {
    if (showFullLoading) setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/miniapps/stocks?symbols=${DEFAULT_SYMBOLS.join(',')}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setStocks(data);
      setLastUpdated(new Date());

      // Preserve selected stock or default to first
      setSelectedStock(prev => {
        if (prev) {
          const updated = data.find(s => s.symbol === prev.symbol);
          return updated || prev;
        }
        return data[0] || null;
      });
    } catch (err) {
      console.error('Stocks fetch error:', err.message);
    } finally {
      if (showFullLoading) setLoading(false);
    }
  };

  // Initial load + auto-refresh every 60s
  useEffect(() => {
    fetchStocks(true);

    intervalRef.current = setInterval(() => {
      fetchStocks(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectStock = (stock) => {
    setDetailLoading(true);
    setTimeout(() => {
      setSelectedStock(stock);
      setDetailLoading(false);
    }, 200);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div
      className="stock-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="stock-header">
        <h2>📈 Stocks</h2>
      </div>

      {/* Search */}
      <motion.div
        className="stock-search"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </motion.div>

      {lastUpdated && (
        <div className="stock-refresh-info">
          Updated: {formatLastUpdated()} · auto-refresh 60s
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading stocks...</div>
      ) : (
        <div className="stock-layout">
          {/* Stock List */}
          <motion.div
            className="stock-list"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h3>Watchlist</h3>
            <div className="list-items">
              {filteredStocks.map((stock) => (
                <motion.button
                  key={stock.symbol}
                  className={`stock-item ${selectedStock?.symbol === stock.symbol ? 'active' : ''}`}
                  onClick={() => handleSelectStock(stock)}
                  whileHover={{ x: 5 }}
                >
                  <div className="item-symbol">{stock.symbol}</div>
                  <div className="item-info">
                    <span className="item-name">{stock.name.substring(0, 12)}</span>
                    <span className={`item-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stock Details */}
          <motion.div
            className="stock-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {detailLoading ? (
              <div className="loading-state">Loading...</div>
            ) : selectedStock ? (
              <motion.div
                className="details-content"
                key={selectedStock.symbol}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Company Info */}
                <div className="company-info">
                  <h2>
                    {selectedStock.symbol}
                    {selectedStock.mock && (
                      <span className="mock-badge" title="Live data unavailable">Demo</span>
                    )}
                  </h2>
                  <p className="company-name">{selectedStock.name}</p>
                  <p className="company-sector">📊 {selectedStock.sector}</p>
                </div>

                {/* Price */}
                <motion.div
                  className="price-section"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <div className="current-price">${selectedStock.price.toFixed(2)}</div>
                  <div className={`price-change ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                    {selectedStock.change >= 0 ? '▲' : '▼'} {Math.abs(selectedStock.change).toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                  </div>
                </motion.div>

                {/* Chart (simplified) */}
                <motion.div
                  className="chart-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="chart-placeholder">
                    <svg viewBox="0 0 300 80" className="chart-svg">
                      <polyline
                        points="0,60 30,50 60,55 90,30 120,40 150,25 180,35 210,20 240,30 270,15 300,10"
                        stroke={selectedStock.change >= 0 ? '#00ff88' : '#ff4444'}
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                  className="stats-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="stat">
                    <span className="stat-label">High</span>
                    <span className="stat-value">${(selectedStock.price * 1.02).toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Low</span>
                    <span className="stat-value">${(selectedStock.price * 0.96).toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Volume</span>
                    <span className="stat-value">
                      {selectedStock.volume > 0
                        ? `${(selectedStock.volume / 1_000_000).toFixed(1)}M`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Change %</span>
                    <span className={`stat-value ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                      {selectedStock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="action-buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <button className="action-btn buy-btn">Buy</button>
                  <button className="action-btn sell-btn">Sell</button>
                </motion.div>
              </motion.div>
            ) : (
              <div className="empty-state">Select a stock to view details</div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Stock;
