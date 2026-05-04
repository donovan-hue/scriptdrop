import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useDeliveryAI = () => {
  const [prediction, setPrediction] = useState(null);
  const [route, setRoute] = useState(null);
  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Predict delivery time
   */
  const predictDeliveryTime = useCallback(async (deliveryData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/delivery/predict`, deliveryData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPrediction(response.data.prediction);
      return response.data.prediction;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error predicting delivery time:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Optimize delivery route
   */
  const optimizeRoute = useCallback(async (routeData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/delivery/optimize-route`, routeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setRoute(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error optimizing route:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Forecast demand
   */
  const forecastDemand = useCallback(async (restaurantId, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/delivery/forecast-demand`,
        { restaurantId, ...options },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setDemand(response.data.forecast);
      return response.data.forecast;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error forecasting demand:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get prediction details
   */
  const getPrediction = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/delivery/prediction/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPrediction(response.data.prediction);
      return response.data.prediction;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error getting prediction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update delivery with actual time
   */
  const updateActualTime = useCallback(async (orderId, actualDeliveryTime) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/delivery/update-actual-time`,
        { orderId, actualDeliveryTime },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data.metrics;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error updating actual time:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get live delivery status
   */
  const getLiveStatus = useCallback(async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/delivery/live-status/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data.status;
    } catch (err) {
      console.error('Error getting live status:', err);
      throw err;
    }
  }, []);

  /**
   * Get analytics
   */
  const getAnalytics = useCallback(async (restaurantId, days = 7) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/delivery/analytics?restaurantId=${restaurantId}&days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      return response.data.analytics;
    } catch (err) {
      console.error('Error getting analytics:', err);
      throw err;
    }
  }, []);

  return {
    prediction,
    route,
    demand,
    loading,
    error,
    predictDeliveryTime,
    optimizeRoute,
    forecastDemand,
    getPrediction,
    updateActualTime,
    getLiveStatus,
    getAnalytics,
    clearError: () => setError(null)
  };
};

export default useDeliveryAI;
