const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const { sendTip, getReceivedTips, getSentTips, getTipsForTarget } = require('../controllers/tipController');

router.post('/send', auth, sendTip);
router.get('/received', auth, getReceivedTips);
router.get('/sent', auth, getSentTips);
router.get('/target/:targetId', getTipsForTarget);

module.exports = router;
