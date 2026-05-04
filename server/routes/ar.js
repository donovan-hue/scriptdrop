const express = require('express');
const { protect: auth } = require('../middleware/auth');
const arTryOnController = require('../controllers/arTryOnController');

const router = express.Router();

// AR Models
router.get('/:productId', arTryOnController.getARProduct);

// Try-on Sessions
router.post('/:productId/start', auth, arTryOnController.startSession);
router.post('/:sessionId/end', auth, arTryOnController.endSession);

// Screenshots
router.post('/:sessionId/screenshot', auth, arTryOnController.saveScreenshot);

// Feedback
router.post('/:sessionId/feedback', auth, arTryOnController.submitFeedback);

// History & Analytics
router.get('/user/history', auth, arTryOnController.getUserHistory);
router.get('/:productId/analytics', arTryOnController.getAnalytics);

module.exports = router;
