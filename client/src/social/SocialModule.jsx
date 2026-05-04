import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Feed from './Feed';
import Profile from './Profile';
import Chat from './Chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SocialModule() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/posts/feed`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Feed posts={posts} setPosts={setPosts} refreshFeed={fetchFeed} />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/chat/:userName" element={<Chat />} />
    </Routes>
  );
}

export default SocialModule;
