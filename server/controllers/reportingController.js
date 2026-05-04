const ContentReport = require('../models/ContentReport');
const UserBlock = require('../models/UserBlock');
const User = require('../models/User');
const Post = require('../models/Post');

exports.reportContent = async (req, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;

    const report = new ContentReport({
      reportedBy: req.user.id,
      contentType,
      contentId,
      reason,
      description,
      priority: ['violence', 'nsfw'].includes(reason) ? 'high' : 'medium'
    });

    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const existingBlock = await UserBlock.findOne({
      blockedBy: req.user.id,
      blockedUser: userId
    });

    if (existingBlock) {
      return res.status(400).json({ success: false, error: 'User already blocked' });
    }

    const block = new UserBlock({
      blockedBy: req.user.id,
      blockedUser: userId,
      reason,
      blockType: 'user_block'
    });

    await block.save();
    res.status(201).json({ success: true, data: block });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await UserBlock.deleteOne({
      blockedBy: req.user.id,
      blockedUser: userId
    });

    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const blocked = await UserBlock.find({ blockedBy: req.user.id })
      .populate('blockedUser', 'username avatar');

    res.json({ success: true, data: blocked });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.appealReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { message } = req.body;

    const report = await ContentReport.findByIdAndUpdate(
      reportId,
      {
        appealStatus: 'pending',
        appealMessage: message
      },
      { new: true }
    );

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
