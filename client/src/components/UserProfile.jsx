import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCamera, FaShoppingBag, FaBox, FaStar, FaMapMarkerAlt, FaBan } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchBlockStatus();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/users/${userId}`),
        axios.get(`${API_URL}/users/${userId}/stats`)
      ]);

      setProfile(profileRes.data.user);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si ya esta bloqueado
  const fetchBlockStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/reporting/blocked-users`);
      const blocked = res.data.data || [];
      const found = blocked.some(
        (b) => b.blockedUser && b.blockedUser._id === userId
      );
      setIsBlocked(found);
    } catch {
      // silenciar — no critico
    }
  };

  // Bloquear / Desbloquear usuario
  const handleBlock = async () => {
    setBlockLoading(true);
    setBlockError(null);
    try {
      if (isBlocked) {
        await axios.delete(`${API_URL}/reporting/block/${userId}`);
        setIsBlocked(false);
      } else {
        await axios.post(`${API_URL}/reporting/block/${userId}`, {
          reason: 'user_initiated'
        });
        setIsBlocked(true);
      }
    } catch (err) {
      setBlockError(err.response?.data?.error || 'Error al actualizar bloqueo');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.post(`${API_URL}/auth/unfollow/${userId}`);
      } else {
        await axios.post(`${API_URL}/auth/follow/${userId}`);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Cargando perfil...</div>;
  if (!profile) return <div className="text-center py-10">Perfil no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header / Cover Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-end space-x-6">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-white"
            />

            <div>
              <h1 className="text-4xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-lg text-blue-100">@{profile.username}</p>
              {profile.location && (
                <p className="flex items-center space-x-1 text-blue-100 mt-1">
                  <FaMapMarkerAlt /> <span>{profile.location}</span>
                </p>
              )}
              {profile.bio && (
                <p className="text-blue-100 mt-2 max-w-2xl">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons — solo mostrar si no es el propio perfil */}
          {currentUser && currentUser.id !== userId && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleFollow}
                className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
                  isFollowing
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                onClick={handleBlock}
                disabled={blockLoading}
                title={isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
                className={`flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
                  isBlocked
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <FaBan />
                <span>{blockLoading ? '...' : isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
              </button>

              {blockError && (
                <p className="text-red-300 text-xs text-center">{blockError}</p>
              )}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-blue-400">
          <div className="text-center">
            <p className="text-3xl font-bold">{stats?.totalPosts || 0}</p>
            <p className="text-blue-100">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats?.followers || 0}</p>
            <p className="text-blue-100">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats?.following || 0}</p>
            <p className="text-blue-100">Following</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">${stats?.totalSpent?.toFixed(2) || 0}</p>
            <p className="text-blue-100">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-300">
        {[
          { id: 'posts', label: 'Posts', icon: '📝' },
          { id: 'orders', label: 'Órdenes', icon: '🍕' },
          { id: 'followers', label: 'Followers', icon: '👥' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 font-semibold border-b-4 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {profile.recentPosts && profile.recentPosts.length > 0 ? (
              profile.recentPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <p className="text-gray-800 mb-3">{post.content}</p>
                  <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="flex space-x-4">
                      <span>👍 {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-10">Sin posts aún</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {profile.recentOrders && profile.recentOrders.length > 0 ? (
              profile.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow p-6 flex justify-between items-center hover:shadow-lg transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-600">${order.totalAmount}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-10">Sin órdenes aún</p>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.followers && profile.followers.length > 0 ? (
              profile.followers.map((follower) => (
                <button
                  key={follower._id}
                  onClick={() => navigate(`/social/profile/${follower._id}`)}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={follower.avatar}
                      alt={follower.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{follower.username}</p>
                      <p className="text-xs text-gray-600">Follower</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-600 py-10 col-span-2">No followers yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
