const mongoose = require('mongoose');

const MiniAppInstanceSchema = new mongoose.Schema({
  // Referencia a la aplicación
  miniApp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniApp',
    required: true
  },

  // Usuario que ejecutó la app
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Identificador único de instancia
  instanceId: {
    type: String,
    unique: true,
    required: true
  },

  // Estado de la instancia
  status: {
    type: String,
    enum: ['created', 'running', 'paused', 'closed', 'error'],
    default: 'created'
  },

  // Datos de la aplicación
  appData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Posición y dimensiones en pantalla
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: Number,
      default: 1
    }
  },

  dimensions: {
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 400
    }
  },

  // Estado de ventana
  windowState: {
    isMinimized: {
      type: Boolean,
      default: false
    },
    isMaximized: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    isFocused: {
      type: Boolean,
      default: false
    }
  },

  // Datos guardados por el usuario
  userState: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Historial de ejecución
  executionLog: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    duration: Number,
    result: mongoose.Schema.Types.Mixed,
    error: String
  }],

  // Métricas de rendimiento
  metrics: {
    executionCount: {
      type: Number,
      default: 0
    },
    totalExecutionTime: {
      type: Number,
      default: 0
    },
    avgExecutionTime: {
      type: Number,
      default: 0
    },
    memoryUsage: {
      type: Number,
      default: 0
    },
    cpuUsage: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    },
    lastError: String
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  startedAt: Date,
  closedAt: Date,

  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 horas
    index: true
  }

}, {
  timestamps: true
});

// TTL Index - Limpiar instancias cerradas después de 7 días
MiniAppInstanceSchema.index({ closedAt: 1 }, { expireAfterSeconds: 604800 });

// Índices para búsquedas rápidas
MiniAppInstanceSchema.index({ user: 1, status: 1 });
MiniAppInstanceSchema.index({ miniApp: 1, status: 1 });
MiniAppInstanceSchema.index({ instanceId: 1 });

module.exports = mongoose.model('MiniAppInstance', MiniAppInstanceSchema);
