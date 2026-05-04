const cron = require('node-cron');
const tokenService = require('./tokenService');

// Schedule daily reward distribution at 2 AM UTC
const scheduleRewardDistribution = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Starting daily reward distribution...');
    try {
      const result = await tokenService.processAttentionRewards();
      console.log('[CRON] Daily rewards distributed:', result);
    } catch (error) {
      console.error('[CRON] Error distributing rewards:', error);
    }
  });

  console.log('[SCHEDULER] Daily reward distribution scheduled for 2 AM UTC');
};

module.exports = { scheduleRewardDistribution };
