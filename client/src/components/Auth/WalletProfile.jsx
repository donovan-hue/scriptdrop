import React, { useState, useEffect } from 'react';
import { FaWallet, FaCopy, FaEthereum, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import useWeb3 from '../../hooks/useWeb3';
import { formatWalletAddress } from '../../services/web3Service';

const WalletProfile = ({ className = '' }) => {
  const {
    isConnected,
    walletAddress,
    balance,
    chainId,
    networkName,
    user,
    ens,
    isLoading,
    error,
    updateWalletInfo,
    refreshProfile
  } = useWeb3();

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected) {
      updateWalletInfo();
      const interval = setInterval(updateWalletInfo, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, updateWalletInfo]);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await updateWalletInfo();
      if (user) {
        await refreshProfile();
      }
    } catch (err) {
      console.error('Error refreshing:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const getEtherscanUrl = () => {
    const chainUrls = {
      1: 'https://etherscan.io',
      5: 'https://goerli.etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      137: 'https://polygonscan.com',
      80001: 'https://mumbai.polygonscan.com',
      56: 'https://bscscan.com',
      97: 'https://testnet.bscscan.com',
      42161: 'https://arbiscan.io',
      43114: 'https://snowscan.xyz'
    };

    const baseUrl = chainUrls[chainId] || 'https://etherscan.io';
    return `${baseUrl}/address/${walletAddress}`;
  };

  if (!isConnected) {
    return (
      <div className={`wallet-profile wallet-not-connected ${className}`}>
        <div className="profile-card">
          <FaWallet className="wallet-icon" />
          <h3>No Wallet Connected</h3>
          <p>Connect your MetaMask wallet to view your profile and balance.</p>
        </div>
        <style jsx>{`
          .wallet-profile {
            width: 100%;
          }

          .wallet-not-connected {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
          }

          .profile-card {
            text-align: center;
            padding: 40px 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 2px dashed #ddd;
          }

          .wallet-icon {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 16px;
          }

          h3 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 18px;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`wallet-profile ${className}`}>
      <div className="profile-header">
        <h2>Wallet Profile</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="refresh-btn"
          title="Refresh wallet data"
        >
          {refreshing ? <FaSpinner className="spinner" /> : '↻'}
        </button>
      </div>

      <div className="profile-card">
        {/* Address Section */}
        <div className="profile-section">
          <label className="section-label">Wallet Address</label>
          <div className="address-block">
            <code className="address-code">{walletAddress}</code>
            <button
              onClick={handleCopyAddress}
              className="copy-btn"
              title="Copy address to clipboard"
            >
              <FaCopy />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={getEtherscanUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="etherscan-link"
              title="View on Etherscan"
            >
              <FaExternalLinkAlt />
            </a>
          </div>
        </div>

        {/* ENS Section */}
        {ens && (
          <div className="profile-section">
            <label className="section-label">ENS Name</label>
            <div className="ens-display">{ens}</div>
          </div>
        )}

        {/* Balance Section */}
        {balance !== null && (
          <div className="profile-section">
            <label className="section-label">Balance</label>
            <div className="balance-display">
              <FaEthereum className="eth-icon" />
              <span className="balance-amount">{parseFloat(balance).toFixed(4)}</span>
              <span className="balance-symbol">ETH</span>
            </div>
          </div>
        )}

        {/* Network Section */}
        {chainId !== null && (
          <div className="profile-section">
            <label className="section-label">Network</label>
            <div className="network-display">
              <span className="network-name">{networkName}</span>
              <span className="chain-id">(Chain ID: {chainId})</span>
            </div>
          </div>
        )}

        {/* User Info Section */}
        {user && (
          <>
            <div className="divider"></div>
            <div className="profile-section">
              <label className="section-label">Account Info</label>
              <div className="account-info">
                <div className="info-item">
                  <span className="info-label">Verified:</span>
                  <span className={`info-value ${user.isVerified ? 'verified' : 'unverified'}`}>
                    {user.isVerified ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                {user.lastLoginAt && (
                  <div className="info-item">
                    <span className="info-label">Last Login:</span>
                    <span className="info-value">
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {user.signatureCount !== undefined && (
                  <div className="info-item">
                    <span className="info-label">Signatures:</span>
                    <span className="info-value">{user.signatureCount}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .wallet-profile {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          font-family: inherit;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .profile-header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          transform: rotate(180deg);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .profile-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-section {
          margin-bottom: 24px;
        }

        .profile-section:last-child {
          margin-bottom: 0;
        }

        .section-label {
          display: block;
          font-size: 12px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .address-block {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background-color: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }

        .address-code {
          flex: 1;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #333;
          word-break: break-all;
          margin: 0;
        }

        .copy-btn,
        .etherscan-link {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          transition: all 0.2s ease;
          text-decoration: none;
          color: #667eea;
        }

        .copy-btn:hover,
        .etherscan-link:hover {
          background-color: #f8f9fa;
          border-color: #667eea;
        }

        .ens-display {
          padding: 12px;
          background-color: #f0f7ff;
          border: 1px solid #b3d9ff;
          border-radius: 8px;
          color: #0066cc;
          font-weight: 600;
          text-align: center;
        }

        .balance-display {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border: 1px solid #667eea30;
          border-radius: 8px;
        }

        .eth-icon {
          font-size: 24px;
          color: #667eea;
        }

        .balance-amount {
          font-size: 28px;
          font-weight: 700;
          color: #333;
        }

        .balance-symbol {
          font-size: 16px;
          font-weight: 600;
          color: #999;
        }

        .network-display {
          padding: 12px;
          background-color: #f5f8ff;
          border: 1px solid #cce0ff;
          border-radius: 8px;
          color: #0066cc;
        }

        .network-name {
          font-weight: 600;
          text-transform: capitalize;
          margin-right: 8px;
        }

        .chain-id {
          font-size: 12px;
          color: #999;
        }

        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 24px 0;
        }

        .account-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-item {
          padding: 12px;
          background-color: #fafafa;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 12px;
          color: #999;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }

        .info-value.verified {
          color: #27ae60;
        }

        .info-value.unverified {
          color: #e74c3c;
        }

        .error-banner {
          padding: 12px;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          color: #c33;
          font-size: 13px;
          margin-top: 16px;
        }

        @media (max-width: 600px) {
          .profile-card {
            padding: 16px;
          }

          .balance-display {
            flex-direction: column;
            align-items: flex-start;
          }

          .account-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletProfile;
