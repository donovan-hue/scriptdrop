const UserWallet = require('../models/UserWallet');
const KronosToken = require('../models/KronosToken');
const Stake = require('../models/Stake');
const AttentionMetrics = require('../models/AttentionMetrics');
const tokenService = require('../services/tokenService');
const ethers = require('ethers');

// Initialize user wallet
const initializeWallet = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let wallet = await UserWallet.findOne({ userId });

    if (wallet) {
      return res.json({ wallet, message: 'Wallet already exists' });
    }

    wallet = new UserWallet({
      userId,
      tokenBalance: ethers.parseUnits('0', 18),
    });

    await wallet.save();
    res.status(201).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get wallet balance
const getBalance = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const balance = await tokenService.getBalance(userId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transfer tokens
const transferTokens = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { toUserId, amount } = req.body;

    if (!toUserId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = await tokenService.transferTokens(userId, toUserId, amount);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stake tokens
const stakeTokens = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { amount, lockPeriod } = req.body;

    if (!amount || !lockPeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (![30, 60, 90].includes(lockPeriod)) {
      return res.status(400).json({ error: 'Invalid lock period' });
    }

    const stake = await tokenService.stakeTokens(userId, amount, lockPeriod);
    res.json(stake);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active stakes
const getStakes = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const stakes = await Stake.find({ userId, status: 'active' });
    res.json(stakes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Claim staking rewards
const claimRewards = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { stakeId } = req.body;

    if (!stakeId) {
      return res.status(400).json({ error: 'Stake ID required' });
    }

    const rewards = await tokenService.claimStakingRewards(userId, stakeId);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Track attention
const trackAttention = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { contentId, creatorId, timeSpentSeconds, sessionId } = req.body;

    if (!contentId || !creatorId || !timeSpentSeconds || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const metric = await tokenService.trackAttention(
      userId,
      contentId,
      creatorId,
      timeSpentSeconds,
      sessionId
    );

    res.json(metric);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'earners', limit = 10 } = req.query;
    const leaderboard = await tokenService.getLeaderboard(type, parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction history
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { limit = 20, skip = 0 } = req.query;

    const wallet = await UserWallet.findOne({ userId }).populate({
      path: 'transactions',
      options: { sort: { createdAt: -1 }, limit: parseInt(limit), skip: parseInt(skip) },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet.transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attention metrics
const getAttentionMetrics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { limit = 20 } = req.query;

    const metrics = await AttentionMetrics.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('contentId creatorId', 'title username');

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get creator earnings
const getCreatorEarnings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { period = '7' } = req.query;

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await AttentionMetrics.find({
      creatorId: userId,
      isRewarded: true,
      rewardDate: { $gte: startDate },
    }).populate('contentId', 'title');

    const earnings = metrics.reduce((total, metric) => {
      return total + parseFloat(ethers.formatUnits(ethers.parseUnits(metric.tokensEarned.toString())));
    }, 0);

    const byContent = metrics.reduce((acc, metric) => {
      const contentId = metric.contentId._id.toString();
      if (!acc[contentId]) {
        acc[contentId] = {
          contentId: metric.contentId._id,
          title: metric.contentId.title,
          earnings: 0,
          views: 0,
        };
      }
      acc[contentId].earnings += parseFloat(ethers.formatUnits(ethers.parseUnits(metric.tokensEarned.toString())));
      acc[contentId].views += 1;
      return acc;
    }, {});

    res.json({
      period: `${days} days`,
      totalEarnings: earnings.toFixed(18),
      contentBreakdown: Object.values(byContent),
      count: metrics.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get token info
const getTokenInfo = async (req, res) => {
  try {
    const token = await KronosToken.findOne();
    res.json({
      name: token.name,
      symbol: token.symbol,
      totalSupply: ethers.formatUnits(ethers.parseUnits(token.totalSupply.toString())),
      circulatingSupply: ethers.formatUnits(ethers.parseUnits(token.circulatingSupply.toString())),
      burnedSupply: ethers.formatUnits(ethers.parseUnits(token.burnedSupply.toString())),
      attentionRate: token.attentionRate,
      stakingAPY: Object.fromEntries(token.stakingAPY),
      dailyRewardPool: ethers.formatUnits(ethers.parseUnits(token.dailyRewardPool.toString())),
      contractAddress: token.contractAddress,
      network: token.network,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  initializeWallet,
  getBalance,
  transferTokens,
  stakeTokens,
  getStakes,
  claimRewards,
  trackAttention,
  getLeaderboard,
  getTransactions,
  getAttentionMetrics,
  getCreatorEarnings,
  getTokenInfo,
};
