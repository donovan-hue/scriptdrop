import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api/stories';

export const useStory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [story, setStory] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [progress, setProgress] = useState(null);

  const getStory = useCallback(async (storyId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/${storyId}`);
      setStory(response.data.data.story);
      setNodes(response.data.data.nodes);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error loading story');
    } finally {
      setLoading(false);
    }
  }, []);

  const startStory = useCallback(async (storyId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/${storyId}/start`);
      setProgress(response.data.data.progress);
      setError(null);
      return response.data.data.node;
    } catch (err) {
      setError(err.response?.data?.error || 'Error starting story');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const makeChoice = useCallback(async (storyId, choiceIndex, timeSpent = 0) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/${storyId}/choice`, {
        choiceIndex,
        timeSpent
      });
      setProgress(response.data.data.progress);
      setError(null);
      return response.data.data.node;
    } catch (err) {
      setError(err.response?.data?.error || 'Error making choice');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const rateStory = useCallback(async (storyId, rating, review = '') => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/${storyId}/rate`, { rating, review });
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Error rating story');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, story, nodes, progress, getStory, startStory, makeChoice, rateStory };
};
