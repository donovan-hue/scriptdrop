import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecommendations } from '../../hooks/useRecommendations';

export default function RecommendationEngine() {
  const [activeTab, setActiveTab] = useState('forYou');
  const { recommendedPosts, recommendedUsers, trending, loading, fetchRecommendedPosts, trackInteraction } = useRecommendations();

  const tabs = [
    { id: 'forYou', label: 'Para Ti', icon: '✨' },
    { id: 'trending', label: 'Viral', icon: '🔥' },
    { id: 'people', label: 'Personas', icon: '👥' }
  ];

  const postsToShow = activeTab === 'trending' ? trending : recommendedPosts;

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'people' ? (
          <motion.div
            key="people"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Personas que quizas conozcas</p>
            {recommendedUsers.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">No hay sugerencias por ahora</p>
            )}
            {recommendedUsers.map(user => (
              <div key={user._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=7c3aed&color=fff`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">@{user.username}</p>
                  {user.bio && <p className="text-white/40 text-xs truncate">{user.bio}</p>}
                </div>
                <button
                  onClick={() => trackInteraction(user._id, 'user', 'follow')}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-xs rounded-full border border-purple-500/30 transition-all"
                >
                  Seguir
                </button>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && postsToShow.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">
                {activeTab === 'trending' ? 'No hay posts virales ahora mismo' : 'Interactua con posts para obtener recomendaciones'}
              </p>
            )}
            {postsToShow.map((post, i) => (
              <PostCard key={post._id || i} post={post} onInteract={trackInteraction} />
            ))}
            {!loading && postsToShow.length > 0 && activeTab === 'forYou' && (
              <button
                onClick={() => fetchRecommendedPosts(Math.ceil(recommendedPosts.length / 20))}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm rounded-xl border border-white/10 transition-all"
              >
                Cargar mas
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post, onInteract }) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onInteract(post._id, 'post', liked ? 'view' : 'like');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/20 transition-all"
      onMouseEnter={() => onInteract(post._id, 'post', 'view', 0, post.tags || [])}
    >
      <div className="flex items-center gap-2 mb-3">
        <img
          src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.username}&background=7c3aed&color=fff`}
          alt={post.author?.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-white/70 text-sm">@{post.author?.username}</span>
        {post.viralScore && (
          <span className="ml-auto text-orange-400 text-xs flex items-center gap-1">
            🔥 {Math.round(post.viralScore)}
          </span>
        )}
      </div>
      {post.content && <p className="text-white/80 text-sm mb-3 line-clamp-3">{post.content}</p>}
      {post.image && (
        <img src={post.image} alt="post" className="w-full h-48 object-cover rounded-lg mb-3" />
      )}
      <div className="flex gap-4 text-white/40 text-sm">
        <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-400' : 'hover:text-red-400'}`}>
          {liked ? '❤️' : '🤍'} {(post.likes?.length || 0) + (liked ? 1 : 0)}
        </button>
        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors"
          onClick={() => onInteract(post._id, 'post', 'comment')}>
          💬 {post.comments?.length || 0}
        </button>
        <button className="flex items-center gap-1 hover:text-green-400 transition-colors"
          onClick={() => onInteract(post._id, 'post', 'share')}>
          🔗 Compartir
        </button>
      </div>
    </motion.div>
  );
}
