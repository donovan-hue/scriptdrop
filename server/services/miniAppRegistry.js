// Mini-App Registry Service - Sistema de plugins
const MiniApp = require('../models/MiniApp');
const MiniAppInstance = require('../models/MiniAppInstance');
const { v4: uuidv4 } = require('uuid');

class MiniAppRegistry {
  constructor() {
    this.registry = new Map();
    this.runningInstances = new Map();
  }

  // Registrar una mini-app en el sistema
  async register(appConfig) {
    try {
      const {
        appId,
        name,
        description,
        componentPath,
        icon = '⚙️',
        color = '#00ff88',
        category = 'utility',
        config = {},
        permissions = {},
        isBuiltIn = false
      } = appConfig;

      // Validación básica
      if (!appId || !name || !description || !componentPath) {
        throw new Error('Missing required fields for mini-app registration');
      }

      // Crear documento en DB
      let miniApp = await MiniApp.findOne({ appId });

      if (!miniApp) {
        miniApp = new MiniApp({
          appId,
          name,
          description,
          icon,
          color,
          category,
          config: { width: 500, height: 400, ...config },
          permissions: { requiresAuth: false, allowedFor: ['all'], ...permissions },
          routes: {
            componentPath,
            apiEndpoints: []
          },
          isBuiltIn,
          enabled: true
        });
        await miniApp.save();
      }

      // Guardar en registro de memoria
      this.registry.set(appId, {
        appId,
        name,
        description,
        componentPath,
        icon,
        color,
        category,
        config,
        permissions,
        isBuiltIn,
        _id: miniApp._id
      });

      console.log(`✓ Mini-app registered: ${appId}`);
      return miniApp;
    } catch (error) {
      console.error(`✗ Error registering mini-app: ${error.message}`);
      throw error;
    }
  }

  // Crear una instancia de la app
  async createInstance(appId, userId) {
    try {
      const appConfig = this.registry.get(appId);
      if (!appConfig) {
        throw new Error(`Mini-app ${appId} not found in registry`);
      }

      const instanceId = uuidv4();

      const instance = new MiniAppInstance({
        miniApp: appConfig._id,
        user: userId,
        instanceId,
        status: 'created',
        appData: {}
      });

      await instance.save();

      // Guardar en memoria
      this.runningInstances.set(instanceId, {
        ...instance.toObject(),
        startTime: Date.now()
      });

      // Actualizar contadores
      await MiniApp.updateOne(
        { appId },
        {
          $inc: {
            'stats.totalInstances': 1,
            'stats.activeInstances': 1
          }
        }
      );

      return instance;
    } catch (error) {
      console.error(`✗ Error creating instance: ${error.message}`);
      throw error;
    }
  }

  // Actualizar estado de instancia
  async updateInstanceStatus(instanceId, newStatus) {
    try {
      const instance = await MiniAppInstance.findOneAndUpdate(
        { instanceId },
        { status: newStatus },
        { new: true }
      );

      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      // Actualizar en memoria
      if (this.runningInstances.has(instanceId)) {
        const cached = this.runningInstances.get(instanceId);
        cached.status = newStatus;
      }

      return instance;
    } catch (error) {
      console.error(`✗ Error updating instance status: ${error.message}`);
      throw error;
    }
  }

  // Ejecutar comando en instancia
  async executeCommand(instanceId, command, params = {}) {
    try {
      const instance = await MiniAppInstance.findOne({ instanceId });
      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      const startTime = Date.now();

      // Simular ejecución (en producción, esto ejecutaría el comando real)
      const result = {
        command,
        params,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        success: true
      };

      // Guardar en log de ejecución
      instance.executionLog.push({
        timestamp: new Date(),
        action: command,
        duration: result.duration,
        result
      });

      // Actualizar métricas
      instance.metrics.executionCount += 1;
      instance.metrics.totalExecutionTime += result.duration;
      instance.metrics.avgExecutionTime = Math.round(
        instance.metrics.totalExecutionTime / instance.metrics.executionCount
      );

      await instance.save();

      return result;
    } catch (error) {
      console.error(`✗ Error executing command: ${error.message}`);
      throw error;
    }
  }

  // Guardar datos del usuario en la instancia
  async saveUserData(instanceId, data) {
    try {
      const instance = await MiniAppInstance.findOneAndUpdate(
        { instanceId },
        { userState: new Map(Object.entries(data)) },
        { new: true }
      );

      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      return instance;
    } catch (error) {
      console.error(`✗ Error saving user data: ${error.message}`);
      throw error;
    }
  }

  // Cerrar instancia
  async closeInstance(instanceId) {
    try {
      const instance = await MiniAppInstance.findOneAndUpdate(
        { instanceId },
        {
          status: 'closed',
          closedAt: new Date()
        },
        { new: true }
      );

      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      // Obtener la app para actualizar contadores
      const app = await MiniApp.findById(instance.miniApp);
      if (app) {
        await MiniApp.updateOne(
          { _id: app._id },
          { $inc: { 'stats.activeInstances': -1 } }
        );
      }

      // Remover de memoria
      this.runningInstances.delete(instanceId);

      return instance;
    } catch (error) {
      console.error(`✗ Error closing instance: ${error.message}`);
      throw error;
    }
  }

  // Obtener todas las mini-apps disponibles
  async getAllAvailable() {
    try {
      const apps = await MiniApp.find({ enabled: true });
      return apps;
    } catch (error) {
      console.error(`✗ Error fetching available apps: ${error.message}`);
      throw error;
    }
  }

  // Obtener mini-app por categoría
  async getByCategory(category) {
    try {
      const apps = await MiniApp.find({ category, enabled: true });
      return apps;
    } catch (error) {
      console.error(`✗ Error fetching apps by category: ${error.message}`);
      throw error;
    }
  }

  // Obtener instancias activas de usuario
  async getUserInstances(userId) {
    try {
      const instances = await MiniAppInstance.find({
        user: userId,
        status: { $in: ['running', 'paused'] }
      }).populate('miniApp');

      return instances;
    } catch (error) {
      console.error(`✗ Error fetching user instances: ${error.message}`);
      throw error;
    }
  }

  // Obtener historial de instancias de usuario
  async getUserHistory(userId, limit = 20) {
    try {
      const instances = await MiniAppInstance.find({ user: userId })
        .populate('miniApp')
        .sort({ closedAt: -1 })
        .limit(limit);

      return instances;
    } catch (error) {
      console.error(`✗ Error fetching user history: ${error.message}`);
      throw error;
    }
  }

  // Obtener estadísticas de una mini-app
  async getAppStats(appId) {
    try {
      const app = await MiniApp.findOne({ appId });
      if (!app) {
        throw new Error(`Mini-app ${appId} not found`);
      }

      const instances = await MiniAppInstance.find({ miniApp: app._id });

      return {
        app: app.name,
        totalInstances: app.stats.totalInstances,
        activeInstances: app.stats.activeInstances,
        totalExecutions: app.stats.totalExecutions,
        avgExecutionTime: app.stats.avgExecutionTime,
        errors: app.stats.errors,
        rating: app.stats.rating,
        recentInstances: instances.slice(-5)
      };
    } catch (error) {
      console.error(`✗ Error fetching app stats: ${error.message}`);
      throw error;
    }
  }

  // Obtener instancia específica
  async getInstance(instanceId) {
    try {
      const instance = await MiniAppInstance.findOne({ instanceId })
        .populate('miniApp')
        .populate('user', 'username email');

      return instance;
    } catch (error) {
      console.error(`✗ Error fetching instance: ${error.message}`);
      throw error;
    }
  }

  // Reinstalar/resetear mini-app
  async resetApp(appId) {
    try {
      // Cerrar todas las instancias
      const instances = await MiniAppInstance.find({
        miniApp: new (require('mongoose')).Types.ObjectId(appId),
        status: { $in: ['running', 'paused'] }
      });

      for (const instance of instances) {
        await this.closeInstance(instance.instanceId);
      }

      // Resetear estadísticas
      await MiniApp.updateOne(
        { appId },
        {
          'stats.totalInstances': 0,
          'stats.activeInstances': 0,
          'stats.totalExecutions': 0,
          'stats.errors': 0
        }
      );

      console.log(`✓ Mini-app ${appId} reset successfully`);
      return true;
    } catch (error) {
      console.error(`✗ Error resetting app: ${error.message}`);
      throw error;
    }
  }
}

// Crear instancia singleton
const registry = new MiniAppRegistry();

module.exports = registry;
