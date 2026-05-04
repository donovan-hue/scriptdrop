// Audio Room Controller - Portal Kronos
const AudioRoom = require('../models/AudioRoom');
const AudioSession = require('../models/AudioSession');

// @desc    Get all audio rooms
// @route   GET /api/audio/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', theme } = req.query;

    let filter = { isActive: true };
    if (theme) filter.theme = theme;

    const skip = (page - 1) * limit;

    const rooms = await AudioRoom.find(filter)
      .populate('owner', 'username avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AudioRoom.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// @desc    Get single audio room
// @route   GET /api/audio/rooms/:id
// @access  Public
exports.getRoom = async (req, res) => {
  try {
    const room = await AudioRoom.findById(req.params.id)
      .populate('owner', 'username avatar');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Get active sessions in room
    const sessions = await AudioSession.find({
      room: req.params.id,
      status: 'active'
    }).populate('user', 'username avatar');

    res.status(200).json({
      success: true,
      data: {
        ...room.toObject(),
        activeSessions: sessions,
        currentUsers: sessions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// @desc    Create audio room
// @route   POST /api/audio/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const { name, description, theme, capacity, audioFormat, visualEffect } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required'
      });
    }

    const room = new AudioRoom({
      name,
      description,
      theme: theme || 'kronos-sci-fi',
      owner: req.user.id,
      capacity: capacity || 50,
      audioFormat: audioFormat || 'spatial-3d',
      visualEffect: visualEffect || 'galaxy'
    });

    await room.save();
    await room.populate('owner', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Update audio room
// @route   PUT /api/audio/rooms/:id
// @access  Private (Owner only)
exports.updateRoom = async (req, res) => {
  try {
    let room = await AudioRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    // Allowed fields to update
    const allowedFields = ['name', 'description', 'theme', 'capacity', 'visualEffect', 'isActive', 'language', 'audioFormat'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    room = await AudioRoom.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('owner', 'username avatar');

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// @desc    Delete audio room
// @route   DELETE /api/audio/rooms/:id
// @access  Private (Owner only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await AudioRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room'
      });
    }

    // Disconnect all active sessions
    await AudioSession.updateMany(
      { room: req.params.id, status: 'active' },
      { status: 'disconnected' }
    );

    await AudioRoom.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

// @desc    Get rooms by theme
// @route   GET /api/audio/rooms/theme/:theme
// @access  Public
exports.getRoomsByTheme = async (req, res) => {
  try {
    const { theme } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const rooms = await AudioRoom.find({ theme, isActive: true })
      .populate('owner', 'username avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AudioRoom.countDocuments({ theme, isActive: true });

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      pages: Math.ceil(total / limit),
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms by theme',
      error: error.message
    });
  }
};

// @desc    Get user's rooms
// @route   GET /api/audio/rooms/user/my-rooms
// @access  Private
exports.getUserRooms = async (req, res) => {
  try {
    const rooms = await AudioRoom.find({ owner: req.user.id })
      .populate('owner', 'username avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user rooms',
      error: error.message
    });
  }
};

// @desc    Get room statistics
// @route   GET /api/audio/rooms/:id/stats
// @access  Private (Owner only)
exports.getRoomStats = async (req, res) => {
  try {
    const room = await AudioRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const sessions = await AudioSession.find({ room: req.params.id });
    const activeSessions = sessions.filter(s => s.status === 'active').length;

    res.status(200).json({
      success: true,
      data: {
        totalSessions: room.totalSessions,
        activeSessions,
        averageDuration: room.averageDuration,
        peakUsers: room.peakUsers,
        createdAt: room.createdAt,
        uptime: new Date() - room.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room stats',
      error: error.message
    });
  }
};
