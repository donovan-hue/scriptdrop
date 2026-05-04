const ARProduct = require('../models/ARProduct');
const ARTryOnSession = require('../models/ARTryOnSession');
const Product = require('../models/Product');

// Get AR models for product
exports.getARProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const arProduct = await ARProduct.findOne({ productId });
    if (!arProduct) return res.status(404).json({ success: false, error: 'AR model not found' });
    res.json({ success: true, data: arProduct });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Start AR try-on session
exports.startSession = async (req, res) => {
  try {
    const { productId } = req.params;
    const { deviceInfo } = req.body;

    const arProduct = await ARProduct.findOne({ productId });
    if (!arProduct) return res.status(404).json({ success: false, error: 'AR model not found' });

    const session = new ARTryOnSession({
      userId: req.user.id,
      productId,
      arProductId: arProduct._id,
      deviceInfo
    });

    await session.save();
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// End AR session
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ARTryOnSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    session.sessionEnded = new Date();
    session.duration = Math.floor((session.sessionEnded - session.sessionStarted) / 1000);
    await session.save();

    // Update product analytics
    await ARProduct.findByIdAndUpdate(session.arProductId, {
      $inc: { 'analytics.timesTried': 1 }
    });

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Save screenshot
exports.saveScreenshot = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { screenshotUrl, filters } = req.body;

    const session = await ARTryOnSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    session.screenshots.push({
      url: screenshotUrl,
      timestamp: new Date(),
      filters: filters || []
    });
    session.screenshotsTaken = session.screenshots.length;
    await session.save();

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { fit, comfort, style, likelihood, wouldBuy, comments, purchaseDecision } = req.body;

    const session = await ARTryOnSession.findByIdAndUpdate(
      sessionId,
      {
        feedback: { fit, comfort, style, likelihood, wouldBuy, comments },
        purchaseDecision
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    // Update product conversion analytics
    const arProduct = await ARProduct.findById(session.arProductId);
    const conversionRate = wouldBuy ? 1 : 0;
    arProduct.analytics.satisfaction = (arProduct.analytics.satisfaction + comfort) / 2;
    arProduct.analytics.conversionRate = conversionRate;
    await arProduct.save();

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get user's try-on history
exports.getUserHistory = async (req, res) => {
  try {
    const sessions = await ARTryOnSession.find({ userId: req.user.id })
      .populate('productId', 'name image price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get AR analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { productId } = req.params;
    const arProduct = await ARProduct.findOne({ productId });
    if (!arProduct) return res.status(404).json({ success: false, error: 'AR product not found' });

    const sessions = await ARTryOnSession.find({ arProductId: arProduct._id });
    const purchases = sessions.filter(s => s.purchaseDecision === 'interested').length;

    res.json({
      success: true,
      data: {
        analytics: arProduct.analytics,
        totalSessions: sessions.length,
        purchaseIntent: sessions.length > 0 ? (purchases / sessions.length) * 100 : 0,
        avgComfort: sessions.reduce((acc, s) => acc + (s.feedback.comfort || 0), 0) / sessions.length || 0
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
