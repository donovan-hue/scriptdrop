import React, { useState, useEffect } from 'react';
import { FaWallet, FaSpinner } from 'react-icons/fa';
import useWeb3 from '../../hooks/useWeb3';
import { formatWalletAddress } from '../../services/web3Service';

const Web3LoginButton = ({ onLoginSuccess, onError, className = '' }) => {
  const {
    isConnected,
    walletAddress,
    checkMetaMask,
    connect,
    disconnect,
    initializeLogin,
    authenticate,
    isLoading,
    error
  } = useWeb3();

  const [step, setStep] = useState('initial'); // initial, connecting, signing, success
  const [localError, setLocalError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleMetaMaskCheck = () => {
    if (!checkMetaMask()) {
      const err = 'MetaMask is not installed. Please install MetaMask from https://metamask.io';
      setLocalError(err);
      if (onError) onError(err);
      return false;
    }
    return true;
  };

  const handleConnect = async () => {
    try {
      setLocalError(null);
      setStep('connecting');

      if (!handleMetaMaskCheck()) {
        setStep('initial');
        return;
      }

      await connect();
      setStep('initial');
    } catch (err) {
      setLocalError(err.message);
      setStep('initial');
      if (onError) onError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      setLocalError(null);
      setStep('signing');

      // Initialize login to get nonce
      const loginData = await initializeLogin();

      // Sign message with nonce
      const result = await authenticate(loginData.nonce);

      setStep('success');
      setShowMenu(false);

      if (onLoginSuccess) {
        onLoginSuccess(result);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setStep('initial');
      }, 2000);
    } catch (err) {
      setLocalError(err.message);
      setStep('initial');
      if (onError) onError(err.message);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setShowMenu(false);
      setStep('initial');
      setLocalError(null);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const displayError = localError || error;

  if (!isConnected) {
    return (
      <div className={`web3-login-button ${className}`}>
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="web3-btn web3-btn-primary"
          title="Connect your MetaMask wallet"
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" />
              Connecting...
            </>
          ) : (
            <>
              <FaWallet />
              Connect Wallet
            </>
          )}
        </button>

        {displayError && (
          <div className="web3-error-message">
            <span>{displayError}</span>
            <button onClick={() => setLocalError(null)} className="close-btn">
              ×
            </button>
          </div>
        )}

        <style jsx>{`
          .web3-login-button {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .web3-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
          }

          .web3-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .web3-btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .web3-btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
          }

          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .web3-error-message {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            background-color: #fee;
            border: 1px solid #fcc;
            border-radius: 6px;
            color: #c33;
            font-size: 13px;
            animation: slideIn 0.3s ease;
          }

          .close-btn {
            background: none;
            border: none;
            color: #c33;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
          }

          .close-btn:hover {
            opacity: 0.7;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`web3-wallet-menu ${className}`}>
      <div className="wallet-menu-container">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="web3-btn web3-btn-connected"
          title="Click to open wallet menu"
        >
          <FaWallet />
          {formatWalletAddress(walletAddress)}
        </button>

        {showMenu && (
          <div className="wallet-menu-dropdown">
            <div className="menu-header">
              <span className="address-label">Wallet Address</span>
              <span className="address-value">{walletAddress}</span>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="menu-item menu-item-login"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  {step === 'connecting' ? 'Connecting...' : 'Signing...'}
                </>
              ) : step === 'success' ? (
                '✓ Logged In'
              ) : (
                'Sign in with Web3'
              )}
            </button>

            <button
              onClick={handleDisconnect}
              className="menu-item menu-item-disconnect"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {displayError && (
        <div className="web3-error-message">
          <span>{displayError}</span>
          <button onClick={() => setLocalError(null)} className="close-btn">
            ×
          </button>
        </div>
      )}

      <style jsx>{`
        .web3-wallet-menu {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wallet-menu-container {
          position: relative;
        }

        .web3-btn-connected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .web3-btn-connected:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .wallet-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          z-index: 1000;
          margin-top: 8px;
          overflow: hidden;
          animation: dropdownOpen 0.2s ease;
        }

        .menu-header {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          background-color: #fafafa;
        }

        .address-label {
          display: block;
          font-size: 12px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .address-value {
          display: block;
          font-size: 13px;
          color: #333;
          font-family: monospace;
          word-break: break-all;
        }

        .menu-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .menu-item:hover:not(:disabled) {
          background-color: #f5f5f5;
        }

        .menu-item:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .menu-item-login {
          color: #667eea;
          border-bottom: 1px solid #f0f0f0;
        }

        .menu-item-login:hover:not(:disabled) {
          background-color: #f5f5ff;
        }

        .menu-item-disconnect {
          color: #e74c3c;
        }

        .menu-item-disconnect:hover {
          background-color: #fff5f5;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dropdownOpen {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .web3-error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          color: #c33;
          font-size: 13px;
          animation: slideIn 0.3s ease;
        }

        .close-btn {
          background: none;
          border: none;
          color: #c33;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
        }

        .close-btn:hover {
          opacity: 0.7;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Web3LoginButton;
