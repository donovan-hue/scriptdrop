import { useState, useCallback } from 'react';
import api from '../services/api';

const useTokens = () => {
  const [balance, setBalance] = useState({
    tokenBalance: '0',
    stakedTokens: '0',
    unstakedTokens: '0',
    pendingRewards: '0',
    totalEarned: '0',
  });

  const [transactions, setTransactions] = useState([]);
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get balance
  const getBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tokens/balance');
      setBalance(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize wallet
  const initializeWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/tokens/wallet/init');
      await getBalance();
    } catch (err) {
      setError(err.message);
      console.error('Error initializing wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [getBalance]);

  // Transfer tokens
  const transfer = useCallback(async (toUserId, amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/tokens/transfer', { toUserId, amount });
      await getBalance();
      await getTransactions();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBalance]);

  // Stake tokens
  const stakeTokens = useCallback(async (amount, lockPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/tokens/stake', { amount, lockPeriod });
      await getBalance();
      await getStakes();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBalance]);

  // Get stakes
  const getStakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tokens/stakes');
      setStakes(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stakes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Claim rewards
  const claimRewards = useCallback(async (stakeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/tokens/claim-rewards', { stakeId });
      await getBalance();
      await getStakes();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBalance, getStakes]);

  // Get transactions
  const getTransactions = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tokens/transactions?limit=${limit}`);
      setTransactions(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get attention metrics
  const getAttentionMetrics = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tokens/attention-metrics?limit=${limit}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get creator earnings
  const getCreatorEarnings = useCallback(async (period = '7') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tokens/creator-earnings?period=${period}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching earnings:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get leaderboard
  const getLeaderboard = useCallback(async (type = 'earners', limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tokens/leaderboard?type=${type}&limit=${limit}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Track attention
  const trackAttention = useCallback(async (contentId, creatorId, timeSpentSeconds, sessionId) => {
    try {
      const response = await api.post('/tokens/track-attention', {
        contentId,
        creatorId,
        timeSpentSeconds,
        sessionId,
      });
      return response.data;
    } catch (err) {
      console.error('Error tracking attention:', err);
      throw err;
    }
  }, []);

  return {
    balance,
    transactions,
    stakes,
    loading,
    error,
    getBalance,
    initializeWallet,
    transfer,
    stakeTokens,
    getStakes,
    claimRewards,
    getTransactions,
    getAttentionMetrics,
    getCreatorEarnings,
    getLeaderboard,
    trackAttention,
  };
};

export default useTokens;
