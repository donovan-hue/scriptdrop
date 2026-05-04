import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

export const useAR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [arProduct, setArProduct] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const getARProduct = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/ar/${productId}`);
      setArProduct(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error loading AR model');
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (productId, deviceInfo) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/ar/${productId}/start`, { deviceInfo });
      setSession(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error starting session');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const endSession = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/ar/${sessionId}/end`);
      setSession(null);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error ending session');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const captureScreenshot = useCallback(async (sessionId) => {
    try {
      if (!canvasRef.current) return null;
      const imageData = canvasRef.current.toDataURL('image/png');
      const response = await axios.post(`/api/ar/${sessionId}/screenshot`, {
        screenshotUrl: imageData
      });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error capturing screenshot');
      return null;
    }
  }, []);

  const submitFeedback = useCallback(async (sessionId, feedback) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/ar/${sessionId}/feedback`, feedback);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting feedback');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ar/user/history');
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error loading history');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const accessCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      setError('Camera access denied');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    session,
    arProduct,
    videoRef,
    canvasRef,
    getARProduct,
    startSession,
    endSession,
    captureScreenshot,
    submitFeedback,
    getUserHistory,
    accessCamera
  };
};
