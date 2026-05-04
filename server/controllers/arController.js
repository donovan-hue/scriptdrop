const ARAsset = require('../models/ARAsset');
const ARSession = require('../models/ARSession');
const Product = require('../models/Product');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

/**
 * Get 3D model for a specific product
 */
exports.getProduct3D = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variationId } = req.query;

    // Find the AR asset for the product
    const arAsset = await ARAsset.findOne({
      productId,
      isActive: true,
    });

    if (!arAsset) {
      return res.status(404).json({
        success: false,
        message: 'No 3D model available for this product',
      });
    }

    // If variationId is specified, get the specific variation
    let modelUrl = arAsset.modelUrl;
    if (variationId) {
      const variation = arAsset.variations.find(
        (v) => v._id.toString() === variationId
      );
      if (variation) {
        modelUrl = variation.modelUrl;
      }
    }

    res.json({
      success: true,
      data: {
        modelUrl,
        modelFormat: arAsset.modelFormat,
        thumbnailUrl: arAsset.thumbnailUrl,
        scale: arAsset.scale,
        position: arAsset.position,
        rotation: arAsset.rotation,
        variations: arAsset.variations.map((v) => ({
          id: v._id,
          name: v.name,
        })),
        performanceSettings: arAsset.performanceSettings,
        metadata: arAsset.metadata,
      },
    });
  } catch (error) {
    console.error('Error fetching 3D model:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching 3D model',
      error: error.message,
    });
  }
};

/**
 * Upload 3D model for a product
 */
exports.uploadModel = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      scale,
      position,
      rotation,
      metadata,
      performanceSettings,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'ar-models',
      public_id: `${productId}-${Date.now()}`,
    });

    // Check if AR asset exists for this product
    let arAsset = await ARAsset.findOne({ productId });

    if (!arAsset) {
      // Create new AR asset
      arAsset = new ARAsset({
        productId,
        modelUrl: uploadResult.secure_url,
        modelFormat: req.file.originalname.split('.').pop().toLowerCase(),
        scale: scale || { x: 1, y: 1, z: 1 },
        position: position || { x: 0, y: 0, z: 0 },
        rotation: rotation || { x: 0, y: 0, z: 0 },
        metadata: metadata || {},
        performanceSettings: performanceSettings || {},
      });
    } else {
      // Update existing AR asset
      arAsset.modelUrl = uploadResult.secure_url;
      arAsset.modelFormat = req.file.originalname.split('.').pop().toLowerCase();
      if (scale) arAsset.scale = scale;
      if (position) arAsset.position = position;
      if (rotation) arAsset.rotation = rotation;
      if (metadata) arAsset.metadata = { ...arAsset.metadata, ...metadata };
      if (performanceSettings)
        arAsset.performanceSettings = {
          ...arAsset.performanceSettings,
          ...performanceSettings,
        };
    }

    await arAsset.save();

    res.json({
      success: true,
      message: 'Model uploaded successfully',
      data: {
        assetId: arAsset._id,
        modelUrl: arAsset.modelUrl,
        modelFormat: arAsset.modelFormat,
      },
    });
  } catch (error) {
    console.error('Error uploading model:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading model',
      error: error.message,
    });
  }
};

/**
 * Create a new AR try-on session
 */
exports.createARSession = async (req, res) => {
  try {
    const { productId, deviceInfo, productVariations } = req.body;
    const userId = req.user?.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const arSession = new ARSession({
      userId,
      productId,
      sessionData: {
        startTime: new Date(),
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          ...deviceInfo,
        },
        cameraPermissionGranted: false,
      },
      productVariations: productVariations || {},
    });

    await arSession.save();

    res.json({
      success: true,
      message: 'AR session created',
      data: {
        sessionId: arSession._id,
      },
    });
  } catch (error) {
    console.error('Error creating AR session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating AR session',
      error: error.message,
    });
  }
};

/**
 * Update AR session with pose and interaction data
 */
exports.updateARSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { poseData, interactions, analytics, cameraPermission } = req.body;

    const arSession = await ARSession.findByIdAndUpdate(
      sessionId,
      {
        $push: {
          poseData: poseData,
          'interactions.zoomEvents': { $each: interactions?.zoomEvents || [] },
          'interactions.rotationEvents': {
            $each: interactions?.rotationEvents || [],
          },
          'interactions.poseChanges': { $each: interactions?.poseChanges || [] },
        },
        $set: {
          'sessionData.cameraPermissionGranted': cameraPermission,
          ...(analytics && { analytics }),
        },
      },
      { new: true }
    );

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found',
      });
    }

    res.json({
      success: true,
      message: 'AR session updated',
      data: { sessionId: arSession._id },
    });
  } catch (error) {
    console.error('Error updating AR session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating AR session',
      error: error.message,
    });
  }
};

/**
 * Save AR preview (screenshot or video)
 */
exports.savePreview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { previewType } = req.body; // 'video' or 'screenshot'

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No preview file uploaded',
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ar-previews',
      resource_type: previewType === 'video' ? 'video' : 'image',
      public_id: `${sessionId}-${previewType}-${Date.now()}`,
    });

    // Update AR session with preview data
    const updateData = {
      $set: {
        [`previewData.${previewType === 'video' ? 'videoUrl' : 'screenshotUrl'}`]:
          uploadResult.secure_url,
        'previewData.timestamp': new Date(),
      },
    };

    const arSession = await ARSession.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true }
    );

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found',
      });
    }

    res.json({
      success: true,
      message: 'Preview saved successfully',
      data: {
        sessionId: arSession._id,
        previewUrl: uploadResult.secure_url,
      },
    });
  } catch (error) {
    console.error('Error saving preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving preview',
      error: error.message,
    });
  }
};

/**
 * End AR session and calculate analytics
 */
exports.endARSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { finalAnalytics } = req.body;

    const arSession = await ARSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          'sessionData.endTime': new Date(),
          analytics: finalAnalytics || {},
        },
      },
      { new: true }
    );

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found',
      });
    }

    // Calculate session duration
    const duration =
      (arSession.sessionData.endTime - arSession.sessionData.startTime) / 1000;
    arSession.sessionData.duration = duration;
    await arSession.save();

    res.json({
      success: true,
      message: 'AR session ended',
      data: {
        sessionId: arSession._id,
        duration,
        analytics: arSession.analytics,
      },
    });
  } catch (error) {
    console.error('Error ending AR session:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending AR session',
      error: error.message,
    });
  }
};

/**
 * Generate shareable link for AR preview
 */
exports.generateShareLink = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { isPublic } = req.body;

    const shareToken = crypto.randomBytes(16).toString('hex');

    const arSession = await ARSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          isPublic: isPublic || true,
          shareToken,
        },
      },
      { new: true }
    );

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found',
      });
    }

    const shareUrl = `${process.env.FRONTEND_URL}/ar/preview/${shareToken}`;

    res.json({
      success: true,
      message: 'Share link generated',
      data: {
        shareUrl,
        shareToken,
      },
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating share link',
      error: error.message,
    });
  }
};

/**
 * Get shared AR preview
 */
exports.getSharedPreview = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const arSession = await ARSession.findOne({
      shareToken,
      isPublic: true,
    }).populate('productId userId');

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'Preview not found or is not shared',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: arSession._id,
        product: arSession.productId,
        user: {
          id: arSession.userId?._id,
          name: arSession.userId?.name,
          avatar: arSession.userId?.avatar,
        },
        preview: arSession.previewData,
        productVariations: arSession.productVariations,
        createdAt: arSession.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching shared preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shared preview',
      error: error.message,
    });
  }
};

/**
 * Get AR session analytics
 */
exports.getSessionAnalytics = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const arSession = await ARSession.findById(sessionId);

    if (!arSession) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: arSession._id,
        duration: arSession.sessionData.duration,
        analytics: arSession.analytics,
        interactions: arSession.interactions,
        timestamp: arSession.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};
