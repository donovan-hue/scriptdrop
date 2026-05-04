// Mini-App Controller
const MiniApp = require('../models/MiniApp');
const MiniAppInstance = require('../models/MiniAppInstance');
const registry = require('../services/miniAppRegistry');

// Obtener todas las mini-apps disponibles
exports.getAllApps = async (req, res) => {
  try {
    const apps = await registry.getAllAvailable();
    res.json({
      success: true,
      count: apps.length,
      data: apps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener mini-apps por categoría
exports.getAppsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const apps = await registry.getByCategory(category);

    res.json({
      success: true,
      category,
      count: apps.length,
      data: apps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener detalles de una mini-app
exports.getAppDetails = async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await MiniApp.findOne({ appId });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Mini-app not found'
      });
    }

    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Crear instancia de mini-app
exports.createInstance = async (req, res) => {
  try {
    const { appId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const instance = await registry.createInstance(appId, userId);

    res.status(201).json({
      success: true,
      instanceId: instance.instanceId,
      data: instance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener instancias activas del usuario
exports.getUserInstances = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const instances = await registry.getUserInstances(userId);

    res.json({
      success: true,
      count: instances.length,
      data: instances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener historial de instancias
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const history = await registry.getUserHistory(userId, parseInt(limit));

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener detalles de una instancia
exports.getInstanceDetails = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const userId = req.user?.id;

    const instance = await registry.getInstance(instanceId);

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Instance not found'
      });
    }

    // Verificar permiso
    if (instance.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    res.json({
      success: true,
      data: instance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar estado de instancia
exports.updateInstanceStatus = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    // Validar status
    const validStatuses = ['created', 'running', 'paused', 'closed', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Verificar propiedad
    const instance = await registry.getInstance(instanceId);
    if (!instance || instance.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const updated = await registry.updateInstanceStatus(instanceId, status);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ejecutar comando en instancia
exports.executeCommand = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { command, params = {} } = req.body;
    const userId = req.user?.id;

    // Verificar propiedad
    const instance = await registry.getInstance(instanceId);
    if (!instance || instance.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const result = await registry.executeCommand(instanceId, command, params);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Guardar datos de usuario en instancia
exports.saveInstanceData = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { data } = req.body;
    const userId = req.user?.id;

    // Verificar propiedad
    const instance = await registry.getInstance(instanceId);
    if (!instance || instance.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const updated = await registry.saveUserData(instanceId, data);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cerrar instancia
exports.closeInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const userId = req.user?.id;

    // Verificar propiedad
    const instance = await registry.getInstance(instanceId);
    if (!instance || instance.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const closed = await registry.closeInstance(instanceId);

    res.json({
      success: true,
      message: 'Instance closed successfully',
      data: closed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener estadísticas de mini-app
exports.getAppStats = async (req, res) => {
  try {
    const { appId } = req.params;
    const stats = await registry.getAppStats(appId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener marketplace completo (con paginación)
exports.getMarketplace = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    let query = { enabled: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    const total = await MiniApp.countDocuments(query);
    const apps = await MiniApp.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ isBuiltIn: -1, 'stats.rating': -1 });

    res.json({
      success: true,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: apps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener categorías disponibles
exports.getCategories = async (req, res) => {
  try {
    const categories = ['productivity', 'tools', 'entertainment', 'utility', 'system'];
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await MiniApp.countDocuments({ category: cat, enabled: true });
        return { name: cat, count };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Crear mini-app
exports.createApp = async (req, res) => {
  try {
    const { appId, name, description, componentPath, ...rest } = req.body;

    const app = await registry.register({
      appId,
      name,
      description,
      componentPath,
      ...rest
    });

    res.status(201).json({
      success: true,
      data: app
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Actualizar mini-app
exports.updateApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const updates = req.body;

    const app = await MiniApp.findOneAndUpdate(
      { appId },
      { $set: updates },
      { new: true }
    );

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Mini-app not found'
      });
    }

    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Eliminar mini-app
exports.deleteApp = async (req, res) => {
  try {
    const { appId } = req.params;

    // Primero resetear la app
    await registry.resetApp(appId);

    // Luego eliminar
    await MiniApp.deleteOne({ appId });

    res.json({
      success: true,
      message: 'Mini-app deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Rate/Review mini-app
exports.rateApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const app = await MiniApp.findOne({ appId });
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Mini-app not found'
      });
    }

    // Store rating in app ratings array
    if (!app.metadata) {
      app.metadata = {};
    }
    if (!app.metadata.ratings) {
      app.metadata.ratings = [];
    }

    // Check if user already rated
    const existingRating = app.metadata.ratings.findIndex(r => r.userId === userId);
    if (existingRating >= 0) {
      app.metadata.ratings[existingRating] = {
        userId,
        rating,
        review: review || '',
        timestamp: new Date()
      };
    } else {
      app.metadata.ratings.push({
        userId,
        rating,
        review: review || '',
        timestamp: new Date()
      });
    }

    // Calculate average rating
    const avgRating = app.metadata.ratings.reduce((sum, r) => sum + r.rating, 0) / app.metadata.ratings.length;
    app.stats.rating = parseFloat(avgRating.toFixed(1));

    await app.save();

    res.json({
      success: true,
      message: 'Rating saved successfully',
      data: {
        appId,
        rating: app.stats.rating,
        totalRatings: app.metadata.ratings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get app ratings/reviews
exports.getAppRatings = async (req, res) => {
  try {
    const { appId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const app = await MiniApp.findOne({ appId });
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Mini-app not found'
      });
    }

    const ratings = app.metadata?.ratings || [];
    const sorted = ratings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    res.json({
      success: true,
      data: {
        appId,
        totalRatings: ratings.length,
        averageRating: app.stats.rating,
        ratings: paginated,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: ratings.length,
          pages: Math.ceil(ratings.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search mini-apps
exports.searchApps = async (req, res) => {
  try {
    const { query, category, limit = 20 } = req.query;

    let filter = { enabled: true };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'metadata.tags': { $regex: query, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const apps = await MiniApp.find(filter)
      .limit(parseInt(limit))
      .sort({ 'stats.rating': -1, isBuiltIn: -1 });

    res.json({
      success: true,
      count: apps.length,
      data: apps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
