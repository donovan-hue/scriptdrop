const UserBlock = require('../models/UserBlock');
const User = require('../models/User');

// POST /api/users/:id/block - Bloquear usuario
exports.blockUser = async (req, res) => {
  try {
    const blockedBy = req.user.id;
    const blockedUser = req.params.id;
    const { reason } = req.body;

    if (blockedBy === blockedUser) {
      return res.status(400).json({ message: 'No puedes bloquearte a ti mismo' });
    }

    const targetUser = await User.findById(blockedUser);
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si ya existe el bloqueo
    const existing = await UserBlock.findOne({ blockedBy, blockedUser });
    if (existing) {
      return res.status(400).json({ message: 'Este usuario ya está bloqueado' });
    }

    const block = new UserBlock({
      blockedBy,
      blockedUser,
      reason: reason || '',
      blockType: 'user_block',
      isPermanent: true
    });

    await block.save();

    res.status(201).json({
      success: true,
      message: 'Usuario bloqueado',
      block
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/:id/block - Desbloquear usuario
exports.unblockUser = async (req, res) => {
  try {
    const blockedBy = req.user.id;
    const blockedUser = req.params.id;

    const block = await UserBlock.findOneAndDelete({ blockedBy, blockedUser });

    if (!block) {
      return res.status(404).json({ message: 'No se encontró el bloqueo' });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario desbloqueado'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/blocked - Listar usuarios bloqueados por el usuario autenticado
exports.getBlockedUsers = async (req, res) => {
  try {
    const blockedBy = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [blocks, totalCount] = await Promise.all([
      UserBlock.find({ blockedBy })
        .populate('blockedUser', '_id username avatar firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      UserBlock.countDocuments({ blockedBy })
    ]);

    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      blockedUsers: blocks.map((b) => ({
        blockId: b._id,
        user: b.blockedUser,
        reason: b.reason,
        blockedAt: b.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
