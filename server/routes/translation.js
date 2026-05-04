// Translation Routes - Real-time Automatic Translation
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const translationController = require('../controllers/translationController');

// ========================
// TRANSLATION ENDPOINTS
// ========================

// Public routes
router.post('/translate', translationController.translateText);
router.post('/batch', translationController.translateBatch);
router.post('/detect', translationController.detectLanguage);
router.get('/languages', translationController.getSupportedLanguages);
router.get('/cache/stats', translationController.getCacheStats);

// Protected routes
router.get('/history', protect, translationController.getTranslationHistory);
router.get('/stats', protect, translationController.getTranslationStats);
router.post('/:id/correct', protect, translationController.saveCorrection);

// Admin routes
router.delete('/cache', protect, translationController.clearCache); // Should add admin check middleware

module.exports = router;
