const express = require('express');
const { protect: auth } = require('../middleware/auth');
const storyController = require('../controllers/storyController');

const router = express.Router();

// Story Management
router.post('/', auth, storyController.createStory);
router.get('/user/my-stories', auth, storyController.getUserStories);
router.get('/published', storyController.getPublishedStories);
router.get('/:id', storyController.getStory);
router.patch('/:storyId/publish', auth, storyController.publishStory);

// Story Nodes
router.post('/:storyId/nodes', auth, storyController.addNode);

// Playing Stories
router.post('/:storyId/start', auth, storyController.startStory);
router.post('/:storyId/choice', auth, storyController.makeChoice);

// Ratings & Reviews
router.post('/:storyId/rate', auth, storyController.rateStory);

// Analytics (handler not implemented — stub)
router.get('/:storyId/analytics', auth, (req, res) =>
  res.json({ storyId: req.params.storyId, views: 0, completions: 0, ratings: [] })
);

module.exports = router;
