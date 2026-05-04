const mongoose = require('mongoose');
const AttentionMetrics = require('../models/AttentionMetrics');
const UserInteraction = require('../models/UserInteraction');

// GET /api/analytics/attention - Metricas de atencion del usuario autenticado
exports.getAttentionMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [metrics, totalCount] = await Promise.all([
      AttentionMetrics.find(filter)
        .populate('contentId', '_id content author')
        .populate('creatorId', '_id username avatar')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      AttentionMetrics.countDocuments(filter)
    ]);

    // Calcular totales del periodo
    const aggregateMatch = { userId: new mongoose.Types.ObjectId(userId) };
    if (filter.createdAt) aggregateMatch.createdAt = filter.createdAt;

    const totals = await AttentionMetrics.aggregate([
      { $match: aggregateMatch },
      {
        $group: {
          _id: null,
          totalTimeSpent: { $sum: '$timeSpentSeconds' },
          totalInteractions: { $count: {} },
          rewardedCount: { $sum: { $cond: ['$isRewarded', 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      summary: totals[0] || { totalTimeSpent: 0, totalInteractions: 0, rewardedCount: 0 },
      metrics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/analytics/attention - Registrar evento de atencion
exports.createAttentionMetric = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      contentId,
      creatorId,
      timeSpentSeconds,
      interactionType,
      sessionId,
      metadata
    } = req.body;

    if (!contentId || !creatorId || !sessionId) {
      return res.status(400).json({
        message: 'contentId, creatorId and sessionId are required'
      });
    }

    const metric = new AttentionMetrics({
      userId,
      contentId,
      creatorId,
      timeSpentSeconds: timeSpentSeconds || 0,
      interactionType: interactionType || 'view',
      sessionId,
      metadata: metadata || {}
    });

    await metric.save();

    res.status(201).json({
      success: true,
      metric
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/analytics/interactions - Ver interacciones del usuario autenticado
exports.getInteractions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, targetType, action } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (targetType) filter.targetType = targetType;
    if (action) filter.action = action;

    const [interactions, totalCount] = await Promise.all([
      UserInteraction.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      UserInteraction.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      interactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/interactions - Registrar interaccion
exports.createInteraction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId, targetType, action, dwellTime, score, tags } = req.body;

    if (!targetId || !targetType || !action) {
      return res.status(400).json({
        message: 'targetId, targetType and action are required'
      });
    }

    const interaction = new UserInteraction({
      userId,
      targetId,
      targetType,
      action,
      dwellTime: dwellTime || 0,
      score: score || 1,
      tags: tags || []
    });

    await interaction.save();

    res.status(201).json({
      success: true,
      interaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
