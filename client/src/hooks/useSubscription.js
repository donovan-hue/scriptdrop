import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEFAULT_FEATURES = {
  unlimitedPosts: false,
  aiGenerator: false,
  noAds: false,
  verifiedBadge: false,
  premiumStickers: false,
  advancedAnalytics: false,
  apiAccess: false,
  prioritySupport: false,
  customShop: false
};

/**
 * Hook que expone tier, features y acciones de suscripción.
 *
 *   const { tier, features, isPro, isBusiness, upgrade, refresh,
 *           cancel, reactivate, subscription, loading } = useSubscription();
 */
const useSubscription = () => {
  const { isAuthenticated } = useAuth();
  const [tier, setTier] = useState('free');
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setTier('free');
      setFeatures(DEFAULT_FEATURES);
      setSubscription(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/subscription/status`);
      setTier(data.tier || 'free');
      setFeatures({ ...DEFAULT_FEATURES, ...(data.features || {}) });
      setSubscription(data.subscription || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Inicia el checkout de Stripe redirigiendo al usuario.
   * @param {'pro'|'business'} target
   */
  const upgrade = useCallback(async (target) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/subscription/checkout`, {
        tier: target
      });
      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }
      throw new Error('Stripe no devolvió una URL de checkout');
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const cancel = useCallback(async () => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/subscription/cancel`);
      setSubscription(data.subscription);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const reactivate = useCallback(async () => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/subscription/reactivate`);
      setSubscription(data.subscription);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  return {
    tier,
    features,
    subscription,
    loading,
    error,
    isPro: tier === 'pro' || tier === 'business',
    isBusiness: tier === 'business',
    isFree: tier === 'free',
    refresh,
    upgrade,
    cancel,
    reactivate
  };
};

export default useSubscription;
