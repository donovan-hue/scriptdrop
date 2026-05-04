import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export const useRecommendations = () => {
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRecommendedPosts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/recommendations/posts?page=${page}`, { headers });
      if (page === 0) setRecommendedPosts(data.posts);
      else setRecommendedPosts(prev => [...prev, ...data.posts]);
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendedUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/recommendations/users`, { headers });
      setRecommendedUsers(data.users);
    } catch (error) {
      console.error('Error fetching recommended users:', error);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/recommendations/trending`);
      setTrending(data.posts);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  }, []);

  const trackInteraction = useCallback(async (targetId, targetType, action, dwellTime = 0, tags = []) => {
    try {
      await axios.post(`${API}/recommendations/track`, { targetId, targetType, action, dwellTime, tags }, { headers });
    } catch {
      // Silent — tracking should never break the UI
    }
  }, []);

  useEffect(() => {
    fetchTrending();
    if (token) {
      fetchRecommendedPosts();
      fetchRecommendedUsers();
    }
  }, []);

  return {
    recommendedPosts,
    recommendedUsers,
    trending,
    loading,
    fetchRecommendedPosts,
    fetchRecommendedUsers,
    fetchTrending,
    trackInteraction
  };
};
