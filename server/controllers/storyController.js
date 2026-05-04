const Story = require('../models/Story');
const StoryNode = require('../models/StoryNode');
const StoryProgress = require('../models/StoryProgress');

exports.createStory = async (req, res) => {
  try {
    const { title, description, genre, cover, tags } = req.body;
    const story = new Story({
      title,
      description,
      genre,
      cover,
      tags: tags || [],
      author: req.user.id
    });
    await story.save();
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getUserStories = async (req, res) => {
  try {
    const stories = await Story.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: stories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getPublishedStories = async (req, res) => {
  try {
    const { genre, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    let query = { status: 'published', isPublic: true };
    if (genre) query.genre = genre;
    const stories = await Story.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar');
    const total = await Story.countDocuments(query);
    res.json({
      success: true,
      data: stories,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    ).populate('author', 'username avatar');
    if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
    const nodes = await StoryNode.find({ storyId: id });
    res.json({ success: true, data: { story, nodes } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.addNode = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title, content, image, isEnding, endingType, choices } = req.body;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
    if (story.author.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
    const node = new StoryNode({
      storyId,
      title,
      content,
      image,
      isEnding,
      endingType,
      choices: choices || [],
      nodeIndex: (await StoryNode.countDocuments({ storyId })) + 1
    });
    await node.save();
    await Story.findByIdAndUpdate(storyId, {
      $inc: { 'choices.total': choices?.length || 0 }
    });
    res.status(201).json({ success: true, data: node });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.startStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    let progress = await StoryProgress.findOne({ userId: req.user.id, storyId });
    if (!progress) {
      const story = await Story.findById(storyId);
      if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
      progress = new StoryProgress({
        userId: req.user.id,
        storyId,
        currentNodeId: story.startNodeId
      });
      await progress.save();
      await Story.findByIdAndUpdate(storyId, { $inc: { 'stats.plays': 1 } });
    }
    const startNode = await StoryNode.findById(progress.currentNodeId);
    res.json({ success: true, data: { progress, node: startNode } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.makeChoice = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { choiceIndex, timeSpent } = req.body;
    let progress = await StoryProgress.findOne({ userId: req.user.id, storyId });
    if (!progress) return res.status(404).json({ success: false, error: 'Story progress not found' });
    const currentNode = await StoryNode.findById(progress.currentNodeId);
    if (!currentNode) return res.status(404).json({ success: false, error: 'Current node not found' });
    const choice = currentNode.choices[choiceIndex];
    if (!choice) return res.status(400).json({ success: false, error: 'Invalid choice' });
    progress.visitedNodes.push({
      nodeId: progress.currentNodeId,
      timeSpent,
      visitedAt: new Date()
    });
    progress.choicesMade.push({
      nodeId: progress.currentNodeId,
      choiceIndex,
      chosenAt: new Date()
    });
    choice.stats.chosen += 1;
    if (choice.consequence === 'ending') {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      progress.endingReached = currentNode.endingType;
      await Story.findByIdAndUpdate(storyId, { $inc: { 'stats.completions': 1 } });
    } else if (choice.nextNodeId) {
      progress.currentNodeId = choice.nextNodeId;
    }
    progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpent;
    await progress.save();
    await currentNode.save();
    const nextNode = await StoryNode.findById(progress.currentNodeId);
    res.json({ success: true, data: { progress, node: nextNode } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.rateStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { rating, review } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }
    const progress = await StoryProgress.findOneAndUpdate(
      { userId: req.user.id, storyId },
      { rating, review },
      { new: true }
    );
    if (!progress) return res.status(404).json({ success: false, error: 'Story progress not found' });
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.publishStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
    if (story.author.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
    story.status = 'published';
    story.isPublic = true;
    await story.save();
    res.json({ success: true, data: story });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
