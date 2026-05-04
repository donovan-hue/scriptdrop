const Post = require('../models/Post');
const { cloudinary } = require('../middleware/upload');

// Crear post con soporte multimedia
exports.createMultimediaPost = async (req, res) => {
  try {
    const { content, visibility = 'public' } = req.body;
    const files = req.files || {};

    const post = new Post({
      author: req.user.id,
      content,
      visibility,
      image: files.image ? files.image[0].path : undefined,
      video: files.video ? files.video[0].path : undefined,
      music: files.music ? files.music[0].path : undefined
    });

    await post.save();
    await post.populate('author', 'username avatar firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    // Limpiar archivos si hay error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach(async (file) => {
          const publicId = file.path.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        });
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Subir solo imagen a post
exports.uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subir video
exports.uploadPostVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }

    res.status(200).json({
      success: true,
      videoUrl: req.file.path,
      duration: req.file.duration || null,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subir música
exports.uploadPostMusic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No music uploaded' });
    }

    res.status(200).json({
      success: true,
      musicUrl: req.file.path,
      duration: req.file.duration || null,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener posts con multimedia filtrando por tipo
exports.getMediaPosts = async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'all', 'videos', 'music', 'images'
    const userId = req.user.id;

    const currentUser = await User.findById(userId);
    const followingIds = [...currentUser.following, userId];

    let filter = {
      author: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] }
    };

    if (type === 'videos') {
      filter.video = { $exists: true, $ne: null };
    } else if (type === 'music') {
      filter.music = { $exists: true, $ne: null };
    } else if (type === 'images') {
      filter.image = { $exists: true, $ne: null };
    }

    const posts = await Post.find(filter)
      .populate('author', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      type,
      count: posts.length,
      posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
