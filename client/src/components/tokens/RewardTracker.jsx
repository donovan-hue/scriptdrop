import React, { useEffect, useState } from 'react';
import useTokens from '../../hooks/useTokens';
import './RewardTracker.css';

const RewardTracker = () => {
  const { getCreatorEarnings, loading } = useTokens();
  const [earnings, setEarnings] = useState(null);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      const data = await getCreatorEarnings(period);
      setEarnings(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };

  const formatToken = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  return (
    <div className="reward-tracker">
      <div className="tracker-header">
        <h1>Reward Tracker</h1>
        <p>Track tokens earned from your content</p>
      </div>

      <div className="period-selector">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="1">Last 1 Day</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading earnings data...</div>
      ) : earnings ? (
        <>
          <div className="earnings-summary">
            <div className="summary-card">
              <div className="label">Total Earned</div>
              <div className="value">{formatToken(earnings.totalEarnings)} KRO</div>
              <div className="period-text">in {earnings.period}</div>
            </div>
            <div className="summary-card">
              <div className="label">Content Count</div>
              <div className="value">{earnings.count}</div>
            </div>
          </div>

          {earnings.contentBreakdown && earnings.contentBreakdown.length > 0 ? (
            <div className="content-breakdown">
              <h2>Earnings by Content</h2>
              <div className="breakdown-list">
                {earnings.contentBreakdown.map((item) => (
                  <div key={item.contentId} className="breakdown-item">
                    <div className="item-info">
                      <div className="title">{item.title}</div>
                      <div className="views">{item.views} views</div>
                    </div>
                    <div className="item-earnings">
                      <div className="earnings">{formatToken(item.earnings)} KRO</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-earnings">No earnings in this period</p>
          )}
        </>
      ) : null}
    </div>
  );
};

export default RewardTracker;
