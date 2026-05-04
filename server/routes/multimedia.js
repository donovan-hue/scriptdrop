const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createMultimediaPost,
  uploadPostImage,
  uploadPostVideo,
  uploadPostMusic,
  getMediaPosts
} = require('../controllers/multimediaController');
const { uploadImage, uploadVideo, uploadMusic } = require('../middleware/upload');

// Upload endpoints
router.post('/upload/image', protect, uploadImage.single('image'), uploadPostImage);
router.post('/upload/video', protect, uploadVideo.single('video'), uploadPostVideo);
router.post('/upload/music', protect, uploadMusic.single('music'), uploadPostMusic);

// Crear post con multimedia
router.post(
  '/post',
  protect,
  uploadImage.single('image'),
  uploadVideo.single('video'),
  uploadMusic.single('music'),
  createMultimediaPost
);

// Obtener posts por tipo de media
router.get('/posts/media', protect, getMediaPosts);

module.exports = router;
