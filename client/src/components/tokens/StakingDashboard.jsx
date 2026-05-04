import React, { useEffect, useState } from 'react';
import useTokens from '../../hooks/useTokens';
import './StakingDashboard.css';

const StakingDashboard = () => {
  const { balance, stakes, stakeTokens, claimRewards, loading } = useTokens();
  const [activeTab, setActiveTab] = useState('available');
  const [stakeForm, setStakeForm] = useState({
    amount: '',
    lockPeriod: '30',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const stakingOptions = [
    { period: 30, apy: 5 },
    { period: 60, apy: 10 },
    { period: 90, apy: 15 },
  ];

  const handleStakeChange = (e) => {
    const { name, value } = e.target;
    setStakeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStake = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!stakeForm.amount) {
      setError('Please enter an amount');
      return;
    }

    const amount = parseFloat(stakeForm.amount);
    const available = parseFloat(balance.tokenBalance);

    if (amount > available) {
      setError('Insufficient balance');
      return;
    }

    try {
      await stakeTokens(amount, parseInt(stakeForm.lockPeriod));
      setMessage(`Successfully staked ${amount} KRO for ${stakeForm.lockPeriod} days`);
      setStakeForm({ amount: '', lockPeriod: '30' });
    } catch (err) {
      setError(err.message || 'Staking failed');
    }
  };

  const handleClaimRewards = async (stakeId) => {
    try {
      await claimRewards(stakeId);
      setMessage('Rewards claimed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to claim rewards');
    }
  };

  const calculateRewards = (amount, lockPeriod) => {
    const apy = stakingOptions.find((opt) => opt.period === parseInt(lockPeriod))?.apy || 5;
    return ((amount * apy * lockPeriod) / 36500).toFixed(2);
  };

  const formatToken = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  return (
    <div className="staking-dashboard">
      <div className="staking-header">
        <h1>Staking Dashboard</h1>
        <p>Earn rewards by staking your KRO tokens</p>
      </div>

      <div className="staking-overview">
        <div className="overview-card">
          <div className="card-label">Available to Stake</div>
          <div className="card-value">{formatToken(balance.tokenBalance)} KRO</div>
        </div>
        <div className="overview-card">
          <div className="card-label">Currently Staked</div>
          <div className="card-value">{formatToken(balance.stakedTokens)} KRO</div>
        </div>
        <div className="overview-card">
          <div className="card-label">Pending Rewards</div>
          <div className="card-value">{formatToken(balance.pendingRewards)} KRO</div>
        </div>
      </div>

      <div className="staking-tabs">
        <button
          className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Stake Tokens
        </button>
        <button
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Stakes
        </button>
      </div>

      {activeTab === 'available' && (
        <div className="stake-section">
          <form onSubmit={handleStake} className="stake-form">
            <div className="form-group">
              <label htmlFor="amount">Amount to Stake</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={stakeForm.amount}
                onChange={handleStakeChange}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="staking-options">
              <h3>Lock Period & APY</h3>
              <div className="options-grid">
                {stakingOptions.map((option) => (
                  <label key={option.period} className="option-label">
                    <input
                      type="radio"
                      name="lockPeriod"
                      value={option.period}
                      checked={stakeForm.lockPeriod === option.period.toString()}
                      onChange={handleStakeChange}
                      disabled={loading}
                    />
                    <div className="option-content">
                      <div className="period">{option.period} Days</div>
                      <div className="apy">{option.apy}% APY</div>
                      {stakeForm.amount && (
                        <div className="rewards">
                          +{calculateRewards(parseFloat(stakeForm.amount), option.period)} KRO
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Processing...' : 'Stake Tokens'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'active' && (
        <div className="active-stakes-section">
          {stakes && stakes.length > 0 ? (
            <div className="stakes-list">
              {stakes.map((stake) => {
                const endDate = new Date(stake.endDate);
                const isCompleted = new Date() >= endDate;
                return (
                  <div key={stake._id} className={`stake-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="stake-info">
                      <div className="info-item">
                        <span className="label">Amount</span>
                        <span className="value">{formatToken(stake.amount)} KRO</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Lock Period</span>
                        <span className="value">{stake.lockPeriod} Days</span>
                      </div>
                      <div className="info-item">
                        <span className="label">APY</span>
                        <span className="value">{stake.apy}%</span>
                      </div>
                      <div className="info-item">
                        <span className="label">End Date</span>
                        <span className="value">{endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Status</span>
                        <span className={`value status-${stake.status}`}>{stake.status}</span>
                      </div>
                    </div>

                    {isCompleted && (
                      <button
                        className="claim-button"
                        onClick={() => handleClaimRewards(stake._id)}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Claim Rewards'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-stakes">No active stakes yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StakingDashboard;
