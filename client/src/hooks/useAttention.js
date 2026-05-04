import { useState, useCallback, useEffect, useRef } from 'react';
import useTokens from './useTokens';

const useAttention = () => {
  const { trackAttention } = useTokens();
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [timeSpent, setTimeSpent] = useState({});
  const contentTimerRef = useRef({});

  // Start tracking attention on a piece of content
  const startTracking = useCallback((contentId, creatorId) => {
    if (contentTimerRef.current[contentId]) {
      return; // Already tracking this content
    }

    const startTime = Date.now();
    contentTimerRef.current[contentId] = {
      contentId,
      creatorId,
      startTime,
    };

    setTimeSpent((prev) => ({
      ...prev,
      [contentId]: prev[contentId] ? prev[contentId] + 1 : 1,
    }));
  }, []);

  // Stop tracking attention on a piece of content
  const stopTracking = useCallback(
    async (contentId) => {
      const tracking = contentTimerRef.current[contentId];
      if (!tracking) {
        return;
      }

      const endTime = Date.now();
      const timeSpentSeconds = Math.round((endTime - tracking.startTime) / 1000);

      delete contentTimerRef.current[contentId];

      // Only track if more than 5 seconds
      if (timeSpentSeconds > 5) {
        try {
          await trackAttention(
            contentId,
            tracking.creatorId,
            timeSpentSeconds,
            sessionId
          );

          return {
            contentId,
            timeSpentSeconds,
            tokensEarned: timeSpentSeconds / 60, // 1 token per minute
          };
        } catch (error) {
          console.error('Failed to track attention:', error);
        }
      }
    },
    [trackAttention, sessionId]
  );

  // Pause tracking (e.g., user minimized tab)
  const pauseTracking = useCallback((contentId) => {
    if (contentTimerRef.current[contentId]) {
      contentTimerRef.current[contentId].paused = true;
    }
  }, []);

  // Resume tracking
  const resumeTracking = useCallback((contentId) => {
    if (contentTimerRef.current[contentId]) {
      contentTimerRef.current[contentId].paused = false;
      contentTimerRef.current[contentId].startTime = Date.now();
    }
  }, []);

  // Get current time spent on a content
  const getCurrentTimeSpent = useCallback((contentId) => {
    return timeSpent[contentId] || 0;
  }, [timeSpent]);

  // Handle visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause all tracking
        Object.keys(contentTimerRef.current).forEach((contentId) => {
          pauseTracking(contentId);
        });
      } else {
        // Tab is visible - resume tracking
        Object.keys(contentTimerRef.current).forEach((contentId) => {
          resumeTracking(contentId);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseTracking, resumeTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(contentTimerRef.current).forEach((contentId) => {
        stopTracking(contentId);
      });
    };
  }, [stopTracking]);

  return {
    sessionId,
    timeSpent,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    getCurrentTimeSpent,
  };
};

export default useAttention;
