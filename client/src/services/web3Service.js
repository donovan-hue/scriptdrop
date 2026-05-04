import { ethers } from 'ethers';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Web3 Service - Utility functions for Web3 interactions
 */

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum?.isMetaMask;
};

/**
 * Get MetaMask provider
 */
export const getMetaMaskProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  return window.ethereum;
};

/**
 * Connect to MetaMask wallet
 */
export const connectWallet = async () => {
  try {
    const provider = getMetaMaskProvider();
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error.message);
    throw error;
  }
};

/**
 * Get current wallet address
 */
export const getCurrentWalletAddress = async () => {
  try {
    const provider = getMetaMaskProvider();
    const accounts = await provider.request({
      method: 'eth_accounts'
    });

    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting wallet address:', error.message);
    return null;
  }
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (address) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting wallet balance:', error.message);
    throw error;
  }
};

/**
 * Get current chain ID
 */
export const getCurrentChainId = async () => {
  try {
    const provider = getMetaMaskProvider();
    const chainId = await provider.request({
      method: 'eth_chainId'
    });
    return parseInt(chainId, 16); // Convert from hex to decimal
  } catch (error) {
    console.error('Error getting chain ID:', error.message);
    throw error;
  }
};

/**
 * Get network name from chain ID
 */
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'ethereum',
    5: 'goerli',
    11155111: 'sepolia',
    137: 'polygon',
    80001: 'mumbai',
    56: 'binance',
    97: 'bsc-testnet',
    42161: 'arbitrum',
    43114: 'avalanche'
  };

  return networks[chainId] || 'unknown';
};

/**
 * Initialize Web3 login - Get nonce from backend
 */
export const initializeWeb3Login = async (walletAddress) => {
  try {
    const response = await axios.post(`${API_URL}/web3/login/initialize`, {
      walletAddress
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error initializing Web3 login:', error.message);
    throw error;
  }
};

/**
 * Sign message with MetaMask
 */
export const signMessage = async (message) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Error signing message:', error.message);
    throw error;
  }
};

/**
 * Verify signature with backend
 */
export const verifyWeb3Signature = async (walletAddress, signature, nonce) => {
  try {
    const response = await axios.post(`${API_URL}/web3/login/verify`, {
      walletAddress,
      signature,
      nonce
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error verifying signature:', error.message);
    throw error;
  }
};

/**
 * Login with wallet address
 */
export const loginWithWallet = async (walletAddress) => {
  try {
    const response = await axios.post(`${API_URL}/web3/login`, {
      walletAddress
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error logging in with wallet:', error.message);
    throw error;
  }
};

/**
 * Get user wallet profile
 */
export const getUserWalletProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/web3/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting wallet profile:', error.message);
    throw error;
  }
};

/**
 * Update wallet balance
 */
export const updateWalletBalance = async (token, balance, chainId, networkName) => {
  try {
    const response = await axios.post(
      `${API_URL}/web3/update-balance`,
      {
        balance,
        chainId,
        networkName
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error updating wallet balance:', error.message);
    throw error;
  }
};

/**
 * Update ENS name
 */
export const updateENS = async (token, ens) => {
  try {
    const response = await axios.post(
      `${API_URL}/web3/update-ens`,
      { ens },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error updating ENS:', error.message);
    throw error;
  }
};

/**
 * Logout
 */
export const logoutWeb3 = async (token) => {
  try {
    const response = await axios.post(
      `${API_URL}/web3/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

/**
 * Resolve ENS name to address
 */
export const resolveENSName = async (ensName) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('Error resolving ENS name:', error.message);
    return null;
  }
};

/**
 * Get ENS name for address
 */
export const getENSName = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    const ensName = await provider.lookupAddress(address);
    return ensName;
  } catch (error) {
    console.error('Error getting ENS name:', error.message);
    return null;
  }
};

/**
 * Format wallet address (show first 6 and last 4 characters)
 */
export const formatWalletAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Check if address is valid Ethereum address
 */
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Listen to account changes
 */
export const onAccountsChanged = (callback) => {
  const provider = getMetaMaskProvider();
  provider.on('accountsChanged', callback);

  return () => provider.removeListener('accountsChanged', callback);
};

/**
 * Listen to chain changes
 */
export const onChainChanged = (callback) => {
  const provider = getMetaMaskProvider();
  provider.on('chainChanged', callback);

  return () => provider.removeListener('chainChanged', callback);
};

/**
 * Listen to disconnect events
 */
export const onDisconnect = (callback) => {
  const provider = getMetaMaskProvider();
  provider.on('disconnect', callback);

  return () => provider.removeListener('disconnect', callback);
};
