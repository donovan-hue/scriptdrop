const Tip = require('../models/Tip');
const UserWallet = require('../models/UserWallet');

exports.sendTip = async (req, res) => {
  try {
    const { toUserId, amount, targetId, targetType, message, anonymous } = req.body;
    const fromUserId = req.user.id;

    if (!toUserId || !amount || amount < 1) {
      return res.status(400).json({ message: 'toUserId and amount (min 1) are required' });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: 'You cannot tip yourself' });
    }

    // Check sender wallet balance
    const senderWallet = await UserWallet.findOne({ userId: fromUserId });
    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient KRO balance' });
    }

    // Debit sender
    await UserWallet.findOneAndUpdate(
      { userId: fromUserId },
      { $inc: { balance: -amount } }
    );

    // Credit receiver (create wallet if it doesn't exist)
    await UserWallet.findOneAndUpdate(
      { userId: toUserId },
      { $inc: { balance: amount } },
      { upsert: true }
    );

    const tip = await Tip.create({
      fromUser: fromUserId,
      toUser: toUserId,
      amount,
      targetId,
      targetType: targetType || 'general',
      message,
      anonymous: anonymous || false
    });

    const populated = await tip.populate([
      { path: 'fromUser', select: 'username avatar' },
      { path: 'toUser', select: 'username avatar' }
    ]);

    res.status(201).json({ tip: populated, message: `Propina de ${amount} KRO enviada exitosamente` });
  } catch (error) {
    console.error('Error sending tip:', error);
    res.status(500).json({ message: 'Error sending tip' });
  }
};

exports.getReceivedTips = async (req, res) => {
  try {
    const { page = 0, limit = 20 } = req.query;
    const tips = await Tip.find({ toUser: req.user.id })
      .populate('fromUser', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(Number(page) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Hide sender if anonymous
    const sanitized = tips.map(t => ({
      ...t,
      fromUser: t.anonymous ? { username: 'Anonimo', avatar: null } : t.fromUser
    }));

    const total = await Tip.countDocuments({ toUser: req.user.id });
    const totalKRO = await Tip.aggregate([
      { $match: { toUser: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({ tips: sanitized, total, totalKRO: totalKRO[0]?.total || 0 });
  } catch (error) {
    console.error('Error fetching received tips:', error);
    res.status(500).json({ message: 'Error fetching tips' });
  }
};

exports.getSentTips = async (req, res) => {
  try {
    const { page = 0, limit = 20 } = req.query;
    const tips = await Tip.find({ fromUser: req.user.id })
      .populate('toUser', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(Number(page) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({ tips });
  } catch (error) {
    console.error('Error fetching sent tips:', error);
    res.status(500).json({ message: 'Error fetching sent tips' });
  }
};

exports.getTipsForTarget = async (req, res) => {
  try {
    const { targetId } = req.params;
    const tips = await Tip.find({ targetId })
      .populate('fromUser', 'username avatar')
      .sort({ amount: -1 })
      .limit(50)
      .lean();

    const totalKRO = tips.reduce((sum, t) => sum + t.amount, 0);
    const sanitized = tips.map(t => ({
      ...t,
      fromUser: t.anonymous ? { username: 'Anonimo', avatar: null } : t.fromUser
    }));

    res.json({ tips: sanitized, totalKRO, count: tips.length });
  } catch (error) {
    console.error('Error fetching target tips:', error);
    res.status(500).json({ message: 'Error fetching tips' });
  }
};
