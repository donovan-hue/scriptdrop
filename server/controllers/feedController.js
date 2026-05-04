const Post = require('../models/Post');
const Product = require('../models/Product');
const User = require('../models/User');
const UserBlock = require('../models/UserBlock');

// Helper: obtener IDs de usuarios bloqueados (en ambas direcciones) para un usuario
const getBlockedUserIds = async (userId) => {
  const blocks = await UserBlock.find({
    $or: [{ blockedBy: userId }, { blockedUser: userId }]
  }).select('blockedBy blockedUser');

  const blockedIds = new Set();
  blocks.forEach((b) => {
    const otherId = b.blockedBy.toString() === userId.toString()
      ? b.blockedUser.toString()
      : b.blockedBy.toString();
    blockedIds.add(otherId);
  });

  return Array.from(blockedIds);
};

// Feed híbrido: intercala posts sociales + productos
exports.getHybridFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [currentUser, blockedIds] = await Promise.all([
      User.findById(userId),
      getBlockedUserIds(userId)
    ]);
    const followingIds = [...currentUser.following, userId]; // Posts propios + gente que sigo

    // Obtener posts
    const posts = await Post.find({
      author: { $in: followingIds, $nin: blockedIds },
      visibility: { $in: ['public', 'followers'] }
    })
      .populate('author', 'username avatar firstName lastName')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Obtener productos recomendados (interleaved)
    const recommendedProducts = await Product.find({
      inStock: true
    })
      .populate('seller', 'username avatar')
      .sort({ rating: -1, totalSales: -1 })
      .limit(Math.ceil(limit / 3));

    // Combinar y mezclar posts con productos
    const hybridFeed = [];
    let postIndex = 0;
    let productIndex = 0;

    while (postIndex < posts.length || productIndex < recommendedProducts.length) {
      // Agregar 2 posts
      if (postIndex < posts.length) {
        hybridFeed.push({
          type: 'post',
          data: posts[postIndex++]
        });
      }
      if (postIndex < posts.length && posts.length > 1) {
        hybridFeed.push({
          type: 'post',
          data: posts[postIndex++]
        });
      }

      // Agregar 1 producto
      if (productIndex < recommendedProducts.length) {
        hybridFeed.push({
          type: 'product',
          data: recommendedProducts[productIndex++]
        });
      }
    }

    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      feed: hybridFeed.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Feed para el Home (recomendaciones personalizadas)
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Posts de gente que sigo
    const [following, blockedIds] = await Promise.all([
      User.findById(userId).select('following'),
      getBlockedUserIds(userId)
    ]);
    const followingIds = [...following.following, userId];

    const [posts, trendingProducts, newUsers] = await Promise.all([
      Post.find({
        author: { $in: followingIds, $nin: blockedIds },
        visibility: { $in: ['public', 'followers'] }
      })
        .populate('author', 'username avatar firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),

      // Productos trending
      Product.find({ inStock: true })
        .populate('seller', 'username avatar')
        .sort({ rating: -1 })
        .limit(3),

      // Nuevos usuarios sugeridos (excluir bloqueados)
      User.find({
        _id: { $ne: userId, $nin: [...followingIds, ...blockedIds] }
      })
        .select('_id username avatar firstName lastName bio followers')
        .limit(3)
        .sort({ createdAt: -1 })
    ]);

    const feed = {
      posts,
      trendingProducts,
      suggestedUsers: newUsers
    };

    res.status(200).json({
      success: true,
      feed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Trending ahora
exports.getTrendingNow = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [trendingPosts, trendingProducts, trendingUsers] = await Promise.all([
      Post.find({
        createdAt: { $gte: thirtyDaysAgo },
        visibility: 'public'
      })
        .populate('author', 'username avatar')
        .sort({ 'likes.length': -1 })
        .limit(10),

      Product.find({
        createdAt: { $gte: thirtyDaysAgo }
      })
        .populate('seller', 'username avatar')
        .sort({ totalSales: -1, rating: -1 })
        .limit(10),

      User.find({
        createdAt: { $gte: thirtyDaysAgo }
      })
        .select('_id username avatar firstName lastName followers')
        .sort({ 'followers.length': -1 })
        .limit(10)
    ]);

    res.status(200).json({
      success: true,
      trending: {
        posts: trendingPosts,
        products: trendingProducts,
        users: trendingUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
