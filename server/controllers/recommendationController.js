const recommendationService = require('../services/recommendationService');

exports.getRecommendedPosts = async (req, res) => {
  try {
    const { limit = 20, page = 0 } = req.query;
    const posts = await recommendationService.recommendPosts(req.user.id, Number(limit), Number(page));
    res.json({ posts, page: Number(page) });
  } catch (error) {
    console.error('Error getting recommended posts:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
};

exports.getRecommendedUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const users = await recommendationService.recommendUsers(req.user.id, Number(limit));
    res.json({ users });
  } catch (error) {
    console.error('Error getting recommended users:', error);
    res.status(500).json({ message: 'Error fetching user recommendations' });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const posts = await recommendationService.getTrendingPosts(Number(limit));
    res.json({ posts });
  } catch (error) {
    console.error('Error getting trending posts:', error);
    res.status(500).json({ message: 'Error fetching trending' });
  }
};

exports.trackInteraction = async (req, res) => {
  try {
    const { targetId, targetType, action, dwellTime, tags } = req.body;
    if (!targetId || !targetType || !action) {
      return res.status(400).json({ message: 'targetId, targetType and action are required' });
    }
    await recommendationService.trackInteraction(
      req.user.id, targetId, targetType, action, dwellTime || 0, tags || []
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ message: 'Error tracking interaction' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const profile = await recommendationService.buildUserProfile(req.user.id);
    res.json({ profile });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};
