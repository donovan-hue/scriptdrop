const UserInteraction = require('../models/UserInteraction');
const Post = require('../models/Post');
const User = require('../models/User');

const ACTION_WEIGHTS = {
  view: 1,
  like: 3,
  comment: 5,
  share: 7,
  save: 6,
  purchase: 10,
  follow: 8,
  dwell: 0.1, // per second
  skip: -2
};

class RecommendationService {

  // Register an interaction
  async trackInteraction(userId, targetId, targetType, action, dwellTime = 0, tags = []) {
    const score = action === 'dwell'
      ? dwellTime * ACTION_WEIGHTS.dwell
      : ACTION_WEIGHTS[action] || 1;

    await UserInteraction.create({ userId, targetId, targetType, action, dwellTime, score, tags });
  }

  // Build user interest profile from recent interactions
  async buildUserProfile(userId, days = 14) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const interactions = await UserInteraction.find({
      userId,
      createdAt: { $gte: since }
    }).lean();

    const tagScores = {};
    const authorScores = {};
    let totalScore = 0;

    for (const i of interactions) {
      totalScore += i.score;
      (i.tags || []).forEach(tag => {
        tagScores[tag] = (tagScores[tag] || 0) + i.score;
      });
    }

    // Get authors of liked/commented posts
    const postIds = interactions
      .filter(i => i.targetType === 'post' && ['like', 'comment', 'save'].includes(i.action))
      .map(i => i.targetId);

    if (postIds.length > 0) {
      const posts = await Post.find({ _id: { $in: postIds } }).select('author').lean();
      posts.forEach(p => {
        const key = p.author?.toString();
        if (key) authorScores[key] = (authorScores[key] || 0) + 2;
      });
    }

    // Normalize
    const sortedTags = Object.entries(tagScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, score]) => ({ tag, score: score / (totalScore || 1) }));

    const topAuthors = Object.entries(authorScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([authorId]) => authorId);

    return { sortedTags, topAuthors, totalInteractions: interactions.length };
  }

  // Recommend posts using hybrid collaborative + content-based approach
  async recommendPosts(userId, limit = 20, page = 0) {
    const profile = await this.buildUserProfile(userId);
    const seenIds = await this.getSeenIds(userId, 'post');

    const topTags = profile.sortedTags.slice(0, 10).map(t => t.tag);
    const topAuthors = profile.topAuthors;

    // Get user's following list
    const user = await User.findById(userId).select('following').lean();
    const following = (user?.following || []).map(id => id.toString());

    const candidates = await Post.aggregate([
      {
        $match: {
          _id: { $nin: seenIds },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $addFields: {
          recencyScore: {
            $divide: [1, { $add: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 3600000] }, 1] }]
          },
          engagementScore: {
            $add: [
              { $size: { $ifNull: ['$likes', []] } },
              { $multiply: [{ $size: { $ifNull: ['$comments', []] } }, 2] }
            ]
          },
          isFollowed: { $cond: [{ $in: ['$author', following.map(id => ({ $toObjectId: id }))] }, 5, 0] },
          isPreferredAuthor: { $cond: [{ $in: [{ $toString: '$author' }, topAuthors] }, 3, 0] },
          tagMatch: {
            $size: {
              $ifNull: [
                { $setIntersection: [{ $ifNull: ['$tags', []] }, topTags] },
                []
              ]
            }
          }
        }
      },
      {
        $addFields: {
          finalScore: {
            $add: [
              { $multiply: ['$recencyScore', 10] },
              { $multiply: ['$engagementScore', 0.5] },
              { $multiply: ['$tagMatch', 4] },
              '$isFollowed',
              '$isPreferredAuthor'
            ]
          }
        }
      },
      { $sort: { finalScore: -1 } },
      { $skip: page * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorData',
          pipeline: [{ $project: { username: 1, avatar: 1 } }]
        }
      },
      { $unwind: { path: '$authorData', preserveNullAndEmpty: true } }
    ]);

    return candidates;
  }

  // Recommend users to follow
  async recommendUsers(userId, limit = 10) {
    const user = await User.findById(userId).select('following').lean();
    const alreadyFollowing = (user?.following || []).map(id => id.toString());
    alreadyFollowing.push(userId.toString());

    const profile = await this.buildUserProfile(userId);

    // Friends of friends
    const fofCandidates = await User.find({
      _id: { $nin: alreadyFollowing },
      followers: { $in: user?.following || [] }
    })
      .select('username avatar bio followersCount')
      .limit(limit * 2)
      .lean();

    // Score them
    const scored = fofCandidates.map(u => ({
      ...u,
      score: (u.followersCount || 0) * 0.01 +
        (profile.topAuthors.includes(u._id.toString()) ? 5 : 0)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  // Viral score for a post (for trending algorithm)
  async calculateViralScore(postId) {
    const interactions = await UserInteraction.find({
      targetId: postId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).lean();

    const velocityScore = interactions.reduce((sum, i) => sum + i.score, 0);

    // Decay by age
    const post = await Post.findById(postId).select('createdAt likes comments').lean();
    if (!post) return 0;

    const ageHours = (Date.now() - new Date(post.createdAt)) / 3600000;
    const decayFactor = Math.pow(0.95, ageHours); // 5% decay per hour

    const engagementBase =
      (post.likes?.length || 0) * 3 +
      (post.comments?.length || 0) * 5;

    return (velocityScore * 2 + engagementBase) * decayFactor;
  }

  // Get IDs of content already seen by user
  async getSeenIds(userId, targetType) {
    const seen = await UserInteraction.find({
      userId,
      targetType,
      action: { $in: ['view', 'like', 'comment', 'skip'] },
      createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    }).distinct('targetId');

    return seen;
  }

  // Trending posts globally
  async getTrendingPosts(limit = 20) {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const trending = await UserInteraction.aggregate([
      { $match: { targetType: 'post', createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$targetId',
          totalScore: { $sum: '$score' },
          interactionCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          viralScore: { $multiply: ['$totalScore', { $size: '$uniqueUsers' }] }
        }
      },
      { $sort: { viralScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: '_id',
          as: 'post'
        }
      },
      { $unwind: '$post' },
      {
        $lookup: {
          from: 'users',
          localField: 'post.author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { username: 1, avatar: 1 } }]
        }
      },
      { $unwind: { path: '$author', preserveNullAndEmpty: true } },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$post', { viralScore: '$viralScore', author: '$author' }] }
        }
      }
    ]);

    return trending;
  }
}

module.exports = new RecommendationService();
