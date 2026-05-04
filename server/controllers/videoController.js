const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'kronos/videos',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    const video = new Video({
      uploadedBy: req.user.id,
      title,
      description,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
      thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_320,h_180,c_fill/'),
      duration: result.duration,
      size: result.bytes,
      format: result.format,
      resolution: `${result.width}x${result.height}`,
      isPublic,
      tags: tags || [],
      status: 'ready'
    });

    await video.save();

    res.status(201).json({ success: true, data: video });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('uploadedBy', 'username avatar');

    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });

    res.json({ success: true, data: video });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getPublicVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true, status: 'ready' };
    if (category) query.category = category;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'username avatar');

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: videos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.likeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json({ success: true, data: video });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });

    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });

    await Video.findByIdAndDelete(videoId);

    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
