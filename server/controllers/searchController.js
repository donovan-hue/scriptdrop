const Post = require('../models/Post');
const Product = require('../models/Product');
const User = require('../models/User');

// Buscar globalmente en todas las entidades
exports.globalSearch = async (req, res) => {
  try {
    const { query, category } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const results = {
      users: [],
      posts: [],
      products: [],
      orders: []
    };

    // Buscar usuarios
    if (!category || category === 'users') {
      results.users = await User.find({
        $or: [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { bio: searchRegex }
        ]
      })
        .select('_id username firstName lastName avatar bio followers')
        .limit(10);
    }

    // Buscar posts
    if (!category || category === 'posts') {
      results.posts = await Post.find({
        $or: [
          { content: searchRegex },
          { 'comments.text': searchRegex }
        ],
        visibility: 'public'
      })
        .populate('author', 'username avatar')
        .limit(10)
        .sort({ createdAt: -1 });
    }

    // Buscar productos (ropa)
    if (!category || category === 'products') {
      results.products = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      })
        .populate('seller', 'username avatar')
        .limit(10);
    }

    res.status(200).json({
      success: true,
      query,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar solo usuarios
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    })
      .select('_id username firstName lastName avatar bio followers')
      .limit(20);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sugerencias de búsqueda
exports.searchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length === 0) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    const searchRegex = { $regex: `^${query}`, $options: 'i' };

    const [usernames, productNames] = await Promise.all([
      User.find({ username: searchRegex })
        .select('username')
        .limit(5),
      Product.find({ name: searchRegex })
        .select('name')
        .limit(5)
    ]);

    const suggestions = [
      ...usernames.map((u) => ({ type: 'user', text: u.username })),
      ...productNames.map((p) => ({ type: 'product', text: p.name }))
    ];

    res.status(200).json({
      success: true,
      suggestions: suggestions.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
