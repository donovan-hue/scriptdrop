import { useState, useCallback, useEffect, useRef } from 'react';
import * as web3Service from '../services/web3Service';

/**
 * useWeb3 Hook - Manages Web3 wallet connection and authentication
 */
export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('web3_token'));
  const [user, setUser] = useState(null);
  const [ens, setEns] = useState(null);

  const listenerCleanupRef = useRef([]);

  /**
   * Check if MetaMask is installed
   */
  const checkMetaMask = useCallback(() => {
    return web3Service.isMetaMaskInstalled();
  }, []);

  /**
   * Connect wallet
   */
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!checkMetaMask()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Connect wallet
      const address = await web3Service.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);

      // Get balance
      const bal = await web3Service.getWalletBalance(address);
      setBalance(bal);

      // Get chain ID
      const cId = await web3Service.getCurrentChainId();
      setChainId(cId);
      setNetworkName(web3Service.getNetworkName(cId));

      // Try to get ENS name
      const ensName = await web3Service.getENSName(address);
      setEns(ensName);

      return address;
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkMetaMask]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setBalance(null);
    setChainId(null);
    setNetworkName(null);
    setToken(null);
    setUser(null);
    setEns(null);
    localStorage.removeItem('web3_token');
    localStorage.removeItem('web3_user');

    // Remove all listeners
    listenerCleanupRef.current.forEach(cleanup => cleanup());
    listenerCleanupRef.current = [];
  }, []);

  /**
   * Initialize Web3 login
   */
  const initializeLogin = useCallback(async () => {
    if (!walletAddress) {
      throw new Error('No wallet address. Please connect wallet first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const loginData = await web3Service.initializeWeb3Login(walletAddress);
      return loginData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Sign and verify message
   */
  const authenticate = useCallback(async (nonce) => {
    if (!walletAddress) {
      throw new Error('No wallet address. Please connect wallet first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}`;

      // Sign message
      const signature = await web3Service.signMessage(message);

      // Verify with backend
      const result = await web3Service.verifyWeb3Signature(walletAddress, signature, nonce);

      // Store token and user data
      localStorage.setItem('web3_token', result.token);
      localStorage.setItem('web3_user', JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Update wallet info (balance, chain)
   */
  const updateWalletInfo = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const bal = await web3Service.getWalletBalance(walletAddress);
      setBalance(bal);

      const cId = await web3Service.getCurrentChainId();
      setChainId(cId);
      setNetworkName(web3Service.getNetworkName(cId));

      if (token) {
        await web3Service.updateWalletBalance(
          token,
          bal,
          cId,
          web3Service.getNetworkName(cId)
        );
      }
    } catch (err) {
      console.error('Error updating wallet info:', err.message);
    }
  }, [walletAddress, token]);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async () => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = await web3Service.getUserWalletProfile(token);
      setUser(profile);
      localStorage.setItem('web3_user', JSON.stringify(profile));
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (token) {
        await web3Service.logoutWeb3(token);
      }
      disconnect();
    } catch (err) {
      setError(err.message);
      disconnect(); // Still disconnect even if logout fails
    } finally {
      setIsLoading(false);
    }
  }, [token, disconnect]);

  /**
   * Setup MetaMask listeners
   */
  useEffect(() => {
    if (!checkMetaMask()) return;

    try {
      const provider = web3Service.getMetaMaskProvider();

      // Listen to account changes
      const accountsUnsubscribe = web3Service.onAccountsChanged((accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          updateWalletInfo();
        }
      });

      // Listen to chain changes
      const chainUnsubscribe = web3Service.onChainChanged((newChainId) => {
        const cId = parseInt(newChainId, 16);
        setChainId(cId);
        setNetworkName(web3Service.getNetworkName(cId));
      });

      listenerCleanupRef.current = [accountsUnsubscribe, chainUnsubscribe];

      // Check if already connected
      const checkConnected = async () => {
        const accounts = await web3Service.getCurrentWalletAddress();
        if (accounts) {
          setWalletAddress(accounts);
          setIsConnected(true);
          updateWalletInfo();
        }
      };

      checkConnected();
    } catch (err) {
      console.error('Error setting up MetaMask listeners:', err.message);
    }

    return () => {
      listenerCleanupRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  /**
   * Restore token from localStorage
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('web3_token');
    const storedUser = localStorage.getItem('web3_user');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err.message);
        localStorage.removeItem('web3_user');
      }
    }
  }, []);

  return {
    // State
    isConnected,
    walletAddress,
    balance,
    chainId,
    networkName,
    isLoading,
    error,
    token,
    user,
    ens,

    // Methods
    checkMetaMask,
    connect,
    disconnect,
    initializeLogin,
    authenticate,
    updateWalletInfo,
    refreshProfile,
    logout
  };
};

export default useWeb3;
