import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMiniApp } from '../../hooks/useMiniApp';
import './miniapps.css';

const MiniAppRatings = ({ appId, appName, onClose }) => {
  const { getAppRatings, rateApp } = useMiniApp();
  const [ratings, setRatings] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [appId]);

  const loadRatings = async () => {
    setLoading(true);
    const data = await getAppRatings(appId);
    if (data) {
      setRatings(data);
    }
    setLoading(false);
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    const result = await rateApp(appId, userRating, userReview);
    if (result) {
      setSubmitted(true);
      setUserRating(0);
      setUserReview('');
      setTimeout(() => {
        loadRatings();
        setSubmitted(false);
      }, 2000);
    }
  };

  const StarRating = ({ value, onHover, onClick, interactive = false }) => {
    return (
      <div className="star-rating" style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.span
            key={star}
            className={`star ${star <= (hoveredRating || value) ? 'filled' : ''}`}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            onClick={() => onClick?.(star)}
            whileHover={{ scale: interactive ? 1.2 : 1 }}
          >
            ⭐
          </motion.span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div
        className="ratings-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="ratings-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="loading-state">Loading ratings...</div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="ratings-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="ratings-content"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ratings-header">
          <h2>{appName} - Reviews</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Summary */}
        <motion.div
          className="ratings-summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="average-rating">
            <div className="big-rating">{ratings?.averageRating?.toFixed(1)}</div>
            <StarRating value={Math.round(ratings?.averageRating || 0)} />
            <p className="total-ratings">{ratings?.totalRatings} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratings?.ratings?.filter(r => r.rating === stars).length || 0;
              const percentage = ratings?.totalRatings ? (count / ratings.totalRatings) * 100 : 0;
              return (
                <motion.div
                  key={stars}
                  className="rating-bar-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (5 - stars) * 0.05 }}
                >
                  <span className="bar-label">{stars}⭐</span>
                  <div className="bar-container">
                    <motion.div
                      className="bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: (5 - stars) * 0.05 + 0.1 }}
                    />
                  </div>
                  <span className="bar-count">{count}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* User Rating Section */}
        <motion.div
          className="user-rating-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Rate this app</h3>
          <StarRating
            value={userRating}
            onHover={setHoveredRating}
            onClick={setUserRating}
            interactive
          />

          <textarea
            className="review-textarea"
            placeholder="Share your thoughts... (optional)"
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            maxLength={500}
          />

          <div className="review-footer">
            <span className="char-count">{userReview.length}/500</span>
            <motion.button
              className="submit-rating-btn"
              onClick={handleSubmitRating}
              disabled={userRating === 0 || submitted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {submitted ? '✓ Submitted' : 'Submit Rating'}
            </motion.button>
          </div>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          className="reviews-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Recent Reviews</h3>
          {ratings?.ratings?.length > 0 ? (
            <AnimatePresence>
              {ratings.ratings.map((review, index) => (
                <motion.div
                  key={`${review.userId}-${review.timestamp}`}
                  className="review-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="review-header">
                    <StarRating value={review.rating} />
                    <span className="review-date">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review && (
                    <p className="review-text">{review.review}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="no-reviews">
              No reviews yet. Be the first to rate!
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MiniAppRatings;
