const express = require('express');
const { protect } = require('../middleware/auth');
const reportingController = require('../controllers/reportingController');

const router = express.Router();

// Report content
router.post('/report', protect, reportingController.reportContent);

// Block users
router.post('/block/:userId', protect, reportingController.blockUser);
router.delete('/block/:userId', protect, reportingController.unblockUser);
router.get('/blocked-users', protect, reportingController.getBlockedUsers);

// Appeals
router.post('/reports/:reportId/appeal', protect, reportingController.appealReport);

module.exports = router;
