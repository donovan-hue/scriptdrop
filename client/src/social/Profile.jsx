import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          axios.get(`${API_URL}/auth/profile`),
          axios.get(`${API_URL}/posts/user/${userId}`)
        ]);

        setProfile(profileRes.data.user);
        setPosts(postsRes.data.posts);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBlockStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/reporting/blocked-users`);
        const blocked = res.data.data || [];
        setIsBlocked(blocked.some((b) => b.blockedUser && b.blockedUser._id === userId));
      } catch {
        // silenciar
      }
    };

    fetchProfile();
    fetchBlockStatus();
  }, [userId]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.post(`${API_URL}/auth/unfollow/${userId}`);
      } else {
        await axios.post(`${API_URL}/auth/follow/${userId}`);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  const handleBlock = async () => {
    setBlockLoading(true);
    try {
      if (isBlocked) {
        await axios.delete(`${API_URL}/reporting/block/${userId}`);
        setIsBlocked(false);
      } else {
        await axios.post(`${API_URL}/reporting/block/${userId}`, { reason: 'user_initiated' });
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Error blocking/unblocking:', error);
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {profile && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-blue-500"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              <p className="text-gray-700 mt-2">{profile.bio}</p>
              <div className="flex space-x-6 mt-4">
                <div>
                  <p className="font-bold text-lg">{profile.followers?.length || 0}</p>
                  <p className="text-gray-600">Followers</p>
                </div>
                <div>
                  <p className="font-bold text-lg">{profile.following?.length || 0}</p>
                  <p className="text-gray-600">Following</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  isFollowing
                    ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              {/* Boton Bloquear — solo si no es el propio perfil */}
              {currentUser && currentUser.id !== userId && (
                <button
                  onClick={handleBlock}
                  disabled={blockLoading}
                  className={`px-6 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
                    isBlocked
                      ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {blockLoading ? '...' : isBlocked ? 'Desbloquear' : 'Bloquear'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-800">{post.content}</p>
            {post.image && <img src={post.image} alt="post" className="w-full rounded-lg mt-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
