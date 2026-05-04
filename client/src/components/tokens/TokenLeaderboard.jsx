import React, { useEffect, useState } from 'react';
import useTokens from '../../hooks/useTokens';
import './TokenLeaderboard.css';

const TokenLeaderboard = () => {
  const { getLeaderboard } = useTokens();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeType, setActiveType] = useState('earners');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(activeType, 20);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatToken = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  const leaderboardTypes = [
    { type: 'earners', label: 'Top Earners' },
    { type: 'stakers', label: 'Top Stakers' },
    { type: 'holders', label: 'Top Holders' },
  ];

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="token-leaderboard">
      <div className="leaderboard-header">
        <h1>Kronos Token Leaderboard</h1>
        <p>See who's leading in the attention economy</p>
      </div>

      <div className="leaderboard-tabs">
        {leaderboardTypes.map((item) => (
          <button
            key={item.type}
            className={`tab-button ${activeType === item.type ? 'active' : ''}`}
            onClick={() => setActiveType(item.type)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col rank">Rank</div>
            <div className="col user">User</div>
            <div className="col value">
              {activeType === 'earners'
                ? 'Total Earned'
                : activeType === 'stakers'
                  ? 'Staked'
                  : 'Holdings'}
            </div>
            <div className="col balance">Balance</div>
          </div>

          {leaderboard.map((entry) => (
            <div key={entry.userId} className="table-row">
              <div className="col rank">
                <span className="medal">{getMedalEmoji(entry.rank)}</span>
                <span className="rank-number">#{entry.rank}</span>
              </div>
              <div className="col user">
                <div className="username">{entry.username}</div>
              </div>
              <div className="col value">
                <div className="amount">
                  {formatToken(
                    entry.totalEarned ||
                      entry.stakedTokens ||
                      (entry.tokenBalance || '0')
                  )}{' '}
                  KRO
                </div>
              </div>
              <div className="col balance">
                <div className="amount">{formatToken(entry.tokenBalance)} KRO</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-leaderboard">No data available</p>
      )}
    </div>
  );
};

export default TokenLeaderboard;
