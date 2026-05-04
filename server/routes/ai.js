const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const {
  generateCaption, generateImage, generateImageVariants,
  analyzeSentiment, generateProductDescription,
  generateHashtags, chat, generateStory
} = require('../controllers/aiController');

router.post('/caption', auth, generateCaption);
router.post('/image', auth, generateImage);
router.post('/image/variants', auth, generateImageVariants);
router.post('/sentiment', auth, analyzeSentiment);
router.post('/product-description', auth, generateProductDescription);
router.post('/hashtags', auth, generateHashtags);
router.post('/chat', auth, chat);
router.post('/story', auth, generateStory);

module.exports = router;
