import React, { useState } from 'react';
import axios from 'axios';
import { FaImage, FaVideo, FaMusic, FaGlobe, FaLock, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Feed({ posts, setPosts, refreshFeed }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', visibility);
      if (image) {
        formData.append('image', image);
      }

      await axios.post(`${API_URL}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setContent('');
      setImage(null);
      setVisibility('public');
      refreshFeed();
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/like`);
      refreshFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Post Creation Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || 'User')}&background=random`}
            alt={user?.username}
            className="w-12 h-12 rounded-full"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || 'User')}&background=random`; }}
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {image && (
          <div className="relative mb-4">
            <img src={URL.createObjectURL(image)} alt="preview" className="w-full max-h-96 rounded-lg" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <label className="cursor-pointer text-blue-500 hover:text-blue-700 flex items-center space-x-2">
              <FaImage /> <span>Photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
            <label className="cursor-pointer text-red-500 hover:text-red-700 flex items-center space-x-2">
              <FaVideo /> <span>Video</span>
            </label>
            <label className="cursor-pointer text-green-500 hover:text-green-700 flex items-center space-x-2">
              <FaMusic /> <span>Music</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="public">🌍 Public</option>
              <option value="followers">👥 Followers</option>
              <option value="private">🔒 Private</option>
            </select>

            <button
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || post.author?.username || 'User')}&background=random`}
                  alt={post.author?.username}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || post.author?.username || 'User')}&background=random`; }}
                />
                <div>
                  <p className="font-semibold text-gray-900">{post.author?.username}</p>
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {post.visibility === 'public' && '🌍'}
                {post.visibility === 'followers' && '👥'}
                {post.visibility === 'private' && '🔒'}
              </span>
            </div>

            <p className="text-gray-800 mb-4">{post.content}</p>

            {post.image && <img src={post.image} alt="post" className="w-full rounded-lg mb-4" />}

            <div className="flex justify-around border-t border-gray-200 pt-4 text-gray-600">
              <button
                onClick={() => handleLike(post._id)}
                className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer"
              >
                <span>👍</span>
                <span>{post.likes?.length || 0}</span>
              </button>
              <div className="flex items-center space-x-2">
                <span>💬</span>
                <span>{post.comments?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>↗️</span>
                <span>{post.shares || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
