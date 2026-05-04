const ethers = require('ethers');
const KronosToken = require('../models/KronosToken');
const UserWallet = require('../models/UserWallet');
const Stake = require('../models/Stake');
const Transaction = require('../models/Transaction');
const AttentionMetrics = require('../models/AttentionMetrics');

const ERC20_ABI = [
  'function balanceOf(address) public view returns (uint256)',
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
];

class TokenService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
    );
    this.privateKey = process.env.PRIVATE_KEY;
    this.signer = this.privateKey ? new ethers.Wallet(this.privateKey, this.provider) : null;
  }

  // Initialize token contract on blockchain
  async deployTokenContract(name, symbol, totalSupply) {
    try {
      if (!this.signer) {
        throw new Error('Signer not configured');
      }

      // Minimal ERC20 deployment would happen here
      // For now, we'll store contract metadata
      const token = new KronosToken({
        name,
        symbol,
        totalSupply: ethers.parseUnits(totalSupply.toString(), 18),
        network: 'sepolia',
      });

      await token.save();
      return token;
    } catch (error) {
      throw new Error(`Token deployment failed: ${error.message}`);
    }
  }

  // Get token balance for wallet
  async getBalance(userId) {
    try {
      const wallet = await UserWallet.findOne({ userId });
      if (!wallet) {
        return {
          tokenBalance: '0',
          stakedTokens: '0',
          unstakedTokens: '0',
          pendingRewards: '0',
        };
      }

      return {
        tokenBalance: wallet.tokenBalance.toString(),
        stakedTokens: wallet.stakedTokens.toString(),
        unstakedTokens: wallet.unstakedTokens.toString(),
        pendingRewards: wallet.pendingRewards.toString(),
        totalEarned: wallet.totalEarned.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // Transfer tokens between users
  async transferTokens(fromUserId, toUserId, amount) {
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      const fromWallet = await UserWallet.findOne({ userId: fromUserId }).session(session);
      const toWallet = await UserWallet.findOne({ userId: toUserId }).session(session);

      if (!fromWallet || !toWallet) {
        throw new Error('Wallet not found');
      }

      const transferAmount = ethers.parseUnits(amount.toString(), 18);
      const fromBalance = ethers.parseUnits(fromWallet.tokenBalance.toString());

      if (fromBalance < transferAmount) {
        throw new Error('Insufficient balance');
      }

      // Update balances
      fromWallet.tokenBalance = ethers.parseUnits(
        (ethers.formatUnits(fromBalance) - amount).toString()
      );
      toWallet.tokenBalance = ethers.parseUnits(
        (ethers.formatUnits(ethers.parseUnits(toWallet.tokenBalance.toString())) + amount).toString()
      );

      await fromWallet.save({ session });
      await toWallet.save({ session });

      // Record transaction
      const transaction = new Transaction({
        fromWalletId: fromWallet._id,
        toWalletId: toWallet._id,
        amount: transferAmount,
        type: 'transfer',
        status: 'completed',
        description: `Transfer from ${fromUserId} to ${toUserId}`,
      });

      await transaction.save({ session });
      fromWallet.transactions.push(transaction._id);
      toWallet.transactions.push(transaction._id);

      await fromWallet.save({ session });
      await toWallet.save({ session });

      await session.commitTransaction();

      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Transfer failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Stake tokens
  async stakeTokens(userId, amount, lockPeriod) {
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      const wallet = await UserWallet.findOne({ userId }).session(session);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const stakeAmount = ethers.parseUnits(amount.toString(), 18);
      const balance = ethers.parseUnits(wallet.tokenBalance.toString());

      if (balance < stakeAmount) {
        throw new Error('Insufficient balance to stake');
      }

      // Get APY for lock period
      const token = await KronosToken.findOne().session(session);
      const apy = token.stakingAPY.get(lockPeriod.toString()) || 5;

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + lockPeriod * 24 * 60 * 60 * 1000);

      // Create stake
      const stake = new Stake({
        walletId: wallet._id,
        userId,
        amount: stakeAmount,
        lockPeriod,
        apy,
        startDate,
        endDate,
      });

      await stake.save({ session });

      // Update wallet
      wallet.tokenBalance = ethers.parseUnits(
        (ethers.formatUnits(balance) - amount).toString()
      );
      wallet.stakedTokens = ethers.parseUnits(
        (ethers.formatUnits(ethers.parseUnits(wallet.stakedTokens.toString())) + amount).toString()
      );
      wallet.stakes.push(stake._id);

      await wallet.save({ session });

      // Record transaction
      const transaction = new Transaction({
        toWalletId: wallet._id,
        amount: stakeAmount,
        type: 'stake',
        status: 'completed',
        description: `Stake ${lockPeriod} days at ${apy}% APY`,
        metadata: { stakeId: stake._id },
      });

      await transaction.save({ session });
      wallet.transactions.push(transaction._id);
      await wallet.save({ session });

      await session.commitTransaction();

      return stake;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Staking failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Claim staking rewards
  async claimStakingRewards(userId, stakeId) {
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      const stake = await Stake.findOne({ _id: stakeId, userId }).session(session);
      if (!stake) {
        throw new Error('Stake not found');
      }

      if (stake.status !== 'active') {
        throw new Error('Stake is not active');
      }

      const now = new Date();
      if (now < stake.endDate) {
        throw new Error('Stake lock period not completed');
      }

      // Calculate rewards
      const principal = ethers.formatUnits(ethers.parseUnits(stake.amount.toString()));
      const rewardAmount = (principal * stake.apy * stake.lockPeriod) / 36500;

      const wallet = await UserWallet.findOne({ _id: stake.walletId }).session(session);

      // Add rewards to wallet
      wallet.tokenBalance = ethers.parseUnits(
        (ethers.formatUnits(ethers.parseUnits(wallet.tokenBalance.toString())) +
          principal +
          rewardAmount).toString()
      );
      wallet.stakedTokens = ethers.parseUnits(
        (ethers.formatUnits(ethers.parseUnits(wallet.stakedTokens.toString())) -
          principal).toString()
      );
      wallet.totalEarned = ethers.parseUnits(
        (ethers.formatUnits(ethers.parseUnits(wallet.totalEarned.toString())) +
          rewardAmount).toString()
      );

      stake.rewardsEarned = ethers.parseUnits(rewardAmount.toString(), 18);
      stake.status = 'completed';
      stake.claimedAt = now;

      await stake.save({ session });
      await wallet.save({ session });

      // Record transaction
      const transaction = new Transaction({
        toWalletId: wallet._id,
        amount: ethers.parseUnits((principal + rewardAmount).toString(), 18),
        type: 'unstake',
        status: 'completed',
        description: `Unstake with ${stake.apy}% APY rewards`,
        metadata: { stakeId: stake._id },
      });

      await transaction.save({ session });
      wallet.transactions.push(transaction._id);
      await wallet.save({ session });

      await session.commitTransaction();

      return {
        principal,
        rewards: rewardAmount,
        total: principal + rewardAmount,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Reward claim failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Process attention rewards
  async processAttentionRewards() {
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const unrewardedMetrics = await AttentionMetrics.find({
        isRewarded: false,
        createdAt: { $gte: today },
      }).session(session);

      if (unrewardedMetrics.length === 0) {
        return { processed: 0, totalRewarded: '0' };
      }

      // Group by creator
      const creatorMetrics = {};
      unrewardedMetrics.forEach((metric) => {
        if (!creatorMetrics[metric.creatorId]) {
          creatorMetrics[metric.creatorId] = {
            totalTimeSeconds: 0,
            metrics: [],
          };
        }
        creatorMetrics[metric.creatorId].totalTimeSeconds += metric.timeSpentSeconds;
        creatorMetrics[metric.creatorId].metrics.push(metric);
      });

      const token = await KronosToken.findOne().session(session);
      const totalRewardPool = ethers.formatUnits(
        ethers.parseUnits(token.dailyRewardPool.toString())
      );
      const totalAttentionSeconds = Object.values(creatorMetrics).reduce(
        (sum, data) => sum + data.totalTimeSeconds,
        0
      );
      const tokensPerSecond = totalRewardPool / totalAttentionSeconds;

      let totalRewarded = 0;

      for (const [creatorId, data] of Object.entries(creatorMetrics)) {
        const creatorReward = data.totalTimeSeconds * tokensPerSecond;
        totalRewarded += creatorReward;

        // Update creator wallet
        const creatorWallet = await UserWallet.findOne({
          userId: creatorId,
        }).session(session);

        if (creatorWallet) {
          creatorWallet.pendingRewards = ethers.parseUnits(
            (ethers.formatUnits(ethers.parseUnits(creatorWallet.pendingRewards.toString())) +
              creatorReward).toString()
          );
          creatorWallet.totalEarned = ethers.parseUnits(
            (ethers.formatUnits(ethers.parseUnits(creatorWallet.totalEarned.toString())) +
              creatorReward).toString()
          );

          await creatorWallet.save({ session });
        }

        // Mark metrics as rewarded
        for (const metric of data.metrics) {
          metric.isRewarded = true;
          metric.tokensEarned = ethers.parseUnits(
            ((metric.timeSpentSeconds * tokensPerSecond).toFixed(18)).toString(),
            18
          );
          metric.rewardDate = new Date();
          await metric.save({ session });
        }
      }

      await session.commitTransaction();

      return {
        processed: unrewardedMetrics.length,
        totalRewarded: totalRewarded.toString(),
        creatorsRewarded: Object.keys(creatorMetrics).length,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Attention reward processing failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Get leaderboard
  async getLeaderboard(type = 'earners', limit = 10) {
    try {
      let leaderboard;

      if (type === 'earners') {
        leaderboard = await UserWallet.find()
          .sort({ totalEarned: -1 })
          .limit(limit)
          .populate('userId', 'username email');
      } else if (type === 'stakers') {
        leaderboard = await UserWallet.find()
          .sort({ stakedTokens: -1 })
          .limit(limit)
          .populate('userId', 'username email');
      } else if (type === 'holders') {
        leaderboard = await UserWallet.find()
          .sort({ tokenBalance: -1 })
          .limit(limit)
          .populate('userId', 'username email');
      }

      return leaderboard.map((wallet, index) => ({
        rank: index + 1,
        userId: wallet.userId._id,
        username: wallet.userId.username,
        [type === 'earners' ? 'totalEarned' : type === 'stakers' ? 'stakedTokens' : 'tokenBalance']:
          ethers.formatUnits(ethers.parseUnits(wallet.totalEarned.toString())),
        tokenBalance: ethers.formatUnits(ethers.parseUnits(wallet.tokenBalance.toString())),
      }));
    } catch (error) {
      throw new Error(`Leaderboard fetch failed: ${error.message}`);
    }
  }

  // Track attention
  async trackAttention(userId, contentId, creatorId, timeSpentSeconds, sessionId) {
    try {
      const token = await KronosToken.findOne();
      const attentionRate = token.attentionRate; // tokens per minute

      const tokensEarned = (timeSpentSeconds / 60) * attentionRate;

      const metric = new AttentionMetrics({
        userId,
        contentId,
        creatorId,
        timeSpentSeconds,
        tokensEarned: ethers.parseUnits(tokensEarned.toFixed(18), 18),
        sessionId,
      });

      await metric.save();

      return metric;
    } catch (error) {
      throw new Error(`Attention tracking failed: ${error.message}`);
    }
  }
}

module.exports = new TokenService();
