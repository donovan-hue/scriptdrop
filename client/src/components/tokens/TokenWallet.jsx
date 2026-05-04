import React, { useEffect, useState } from 'react';
import useTokens from '../../hooks/useTokens';
import './TokenWallet.css';

const TokenWallet = () => {
  const { balance, transactions, getBalance, getTransactions, loading } = useTokens();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getBalance();
    getTransactions();
  }, []);

  const formatToken = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  return (
    <div className="token-wallet">
      <div className="wallet-header">
        <h1>KRO Wallet</h1>
        <span className="wallet-badge">Kronos Token</span>
      </div>

      {loading ? (
        <div className="loading">Loading wallet data...</div>
      ) : (
        <>
          <div className="balance-overview">
            <div className="balance-card primary">
              <div className="card-label">Total Balance</div>
              <div className="card-value">{formatToken(balance.tokenBalance)} KRO</div>
            </div>

            <div className="balance-card">
              <div className="card-label">Staked Tokens</div>
              <div className="card-value">{formatToken(balance.stakedTokens)} KRO</div>
            </div>

            <div className="balance-card">
              <div className="card-label">Pending Rewards</div>
              <div className="card-value">{formatToken(balance.pendingRewards)} KRO</div>
            </div>

            <div className="balance-card">
              <div className="card-label">Total Earned</div>
              <div className="card-value">{formatToken(balance.totalEarned)} KRO</div>
            </div>
          </div>

          <div className="wallet-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="overview-section">
              <h3>Wallet Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Available Balance</span>
                  <span className="value">{formatToken(balance.unstakedTokens)} KRO</span>
                </div>
                <div className="summary-item">
                  <span className="label">Locked in Staking</span>
                  <span className="value">{formatToken(balance.stakedTokens)} KRO</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-section">
              <h3>Recent Transactions</h3>
              {transactions && transactions.length > 0 ? (
                <div className="transactions-list">
                  {transactions.map((tx) => (
                    <div key={tx._id} className="transaction-item">
                      <div className="tx-type">{tx.type}</div>
                      <div className="tx-amount">{formatToken(tx.amount)} KRO</div>
                      <div className="tx-status">{tx.status}</div>
                      <div className="tx-date">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-transactions">No transactions yet</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TokenWallet;
