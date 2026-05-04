import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from './videos/VideoPlayer';
import { HoloText, GlassCard, BottomNav } from './kronos';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HybridFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/feed/hybrid`, {
        params: { page, limit: 20 },
      });
      setFeed(response.data.feed);
    } catch (e) {
      console.error('Error fetching hybrid feed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/like`);
      fetchFeed();
    } catch (e) {
      console.error('Error liking post:', e);
    }
  };

  return (
    <div
      className="k-theme"
      style={{ minHeight: '100vh', background: '#08080f', paddingBottom: 80 }}
    >
      <div
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 680,
          margin: '0 auto',
        }}
      >
        <HoloText size={26}>Feed</HoloText>
        <div style={{ display: 'flex', gap: 14, fontSize: 22 }}>
          <span style={{ cursor: 'pointer' }}>🔔</span>
          <span style={{ cursor: 'pointer' }}>✨</span>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
        {loading && feed.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>
            Cargando feed...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {feed.map((item) => {
              if (item.type === 'post') {
                const post = item.data;
                return (
                  <GlassCard key={`post-${post._id}`}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={post.author?.avatar || 'https://via.placeholder.com/40'}
                        alt={post.author?.username}
                        onClick={() => navigate(`/social/profile/${post.author._id}`)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                          {post.author?.firstName} {post.author?.lastName}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>⋯</span>
                    </div>

                    {post.content && (
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: 14,
                          marginBottom: 10,
                        }}
                      >
                        {post.content}
                      </div>
                    )}

                    {post.image && (
                      <img
                        src={post.image}
                        alt="post"
                        style={{
                          width: '100%',
                          borderRadius: 10,
                          maxHeight: 400,
                          objectFit: 'cover',
                          marginBottom: 10,
                        }}
                      />
                    )}

                    {post.video && (
                      <div style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden' }}>
                        <VideoPlayer src={post.video} poster={post.image} />
                      </div>
                    )}

                    {post.music && (
                      <div
                        style={{
                          background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          borderRadius: 10,
                          padding: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          🎵
                        </div>
                        <audio src={post.music} controls style={{ flex: 1 }} />
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        gap: 20,
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 13,
                        paddingTop: 8,
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <button
                        onClick={() => handleLike(post._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        ❤️ {post.likes?.length || 0}
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        💬 {post.comments?.length || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        🔄 {post.shares || 0}
                      </span>
                    </div>
                  </GlassCard>
                );
              }

              const product = item.data;
              return (
                <GlassCard
                  key={`product-${product._id}`}
                  onClick={() => navigate(`/shop/product/${product._id}`)}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid rgba(168,85,247,0.2)',
                    background:
                      'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))',
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 12,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
                          {product.name}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
                            color: '#fff',
                          }}
                        >
                          🛍️
                        </span>
                      </div>
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.55)',
                          fontSize: 12,
                          marginBottom: 8,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span
                          style={{
                            color: '#a855f7',
                            fontSize: 18,
                            fontWeight: 800,
                          }}
                        >
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span
                            style={{
                              color: 'rgba(255,255,255,0.3)',
                              fontSize: 13,
                              textDecoration: 'line-through',
                            }}
                          >
                            ${product.originalPrice}
                          </span>
                        )}
                        <span style={{ color: '#facc15', fontSize: 12, marginLeft: 'auto' }}>
                          ⭐ {product.rating || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {feed.length > 0 && (
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <button
              className="k-btn-primary"
              style={{ maxWidth: 200 }}
              onClick={() => {
                setPage(page + 1);
                fetchFeed();
              }}
            >
              Cargar más
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default HybridFeed;
