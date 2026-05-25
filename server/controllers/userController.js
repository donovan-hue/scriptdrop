const User = require('../models/User');
const Post = require('../models/Post');
const Order = require('../models/Order');
const UserBlock = require('../models/UserBlock');
const { cloudinary } = require('../middleware/upload');

// Obtener perfil completo del usuario
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user ? req.user.id : null;

    // Verificar bloqueo si hay usuario autenticado
    if (requesterId && requesterId !== userId) {
      const block = await UserBlock.findOne({
        $or: [
          { blockedBy: requesterId, blockedUser: userId },
          { blockedBy: userId, blockedUser: requesterId }
        ]
      });

      if (block) {
        return res.status(403).json({ message: 'No puedes ver este perfil' });
      }
    }

    const user = await User.findById(userId)
      .populate('followers', '_id username avatar')
      .populate('following', '_id username avatar');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Historial de posts
    const posts = await Post.find({ author: userId })
      .select('_id content createdAt likes comments')
      .sort({ createdAt: -1 })
      .limit(10);

    // Historial de órdenes (si es cliente)
    const orders = await Order.find({ customer: userId })
      .select('_id totalAmount status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        role: user.role,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt
      },
      stats: {
        totalPosts: posts.length,
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
      },
      recentPosts: posts,
      recentOrders: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar perfil de usuario
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, location, website } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        bio,
        location,
        website
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar avatar
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);

    // Eliminar avatar anterior si existe
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`super-app/profiles/${publicId}`);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      avatar: user.avatar,
      message: 'Avatar updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener historial de compras de ropa
exports.getClothingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Búsqueda en órdenes de e-commerce (implementado con un campo adicional)
    const orders = await Order.find({
      customer: userId,
      type: 'clothing'
    })
      .populate('restaurant', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener historial de órdenes de comida
exports.getFoodOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ customer: userId })
      .populate('restaurant', 'username avatar')
      .populate('deliveryPerson', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener estadísticas del usuario
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, posts, orders] = await Promise.all([
      User.findById(userId),
      Post.find({ author: userId }),
      Order.find({ customer: userId })
    ]);

    const stats = {
      username: user.username,
      followers: user.followers.length,
      following: user.following.length,
      totalPosts: posts.length,
      totalLikesReceived: posts.reduce((sum, p) => sum + p.likes.length, 0),
      totalComments: posts.reduce((sum, p) => sum + p.comments.length, 0),
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      joinedDate: user.createdAt
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('following');
    const excludeIds = [...(me.following || []), req.user.id];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('username firstName lastName avatar bio followers')
      .sort({ followers: -1 })
      .limit(10);

    // Shuffle and return 5
    const shuffled = users.sort(() => 0.5 - Math.random()).slice(0, 5);
    res.json({ success: true, users: shuffled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
