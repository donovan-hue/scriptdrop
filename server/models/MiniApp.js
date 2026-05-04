const mongoose = require('mongoose');

const MiniAppSchema = new mongoose.Schema({
  // Identificador único
  appId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Metadata básica
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  version: {
    type: String,
    default: '1.0.0'
  },

  // Información del desarrollador
  author: {
    type: String,
    default: 'System'
  },

  category: {
    type: String,
    enum: ['productivity', 'tools', 'entertainment', 'utility', 'system'],
    default: 'utility'
  },

  // Icono y tema
  icon: {
    type: String,
    default: '⚙️'
  },

  color: {
    type: String,
    default: '#00ff88'
  },

  backgroundColor: {
    type: String,
    default: 'rgba(0, 255, 136, 0.1)'
  },

  // Configuración de la app
  config: {
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 400
    },
    minWidth: {
      type: Number,
      default: 300
    },
    minHeight: {
      type: Number,
      default: 250
    },
    resizable: {
      type: Boolean,
      default: true
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },

  // Configuración de permisos
  permissions: {
    requiresAuth: {
      type: Boolean,
      default: false
    },
    allowedFor: {
      type: [String],
      default: ['all']
    },
    features: {
      type: [String],
      default: ['read']
    }
  },

  // Rutas y endpoints
  routes: {
    componentPath: {
      type: String,
      required: true
    },
    apiEndpoints: [{
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET'
      },
      path: String,
      description: String
    }]
  },

  // Estado
  enabled: {
    type: Boolean,
    default: true
  },

  isBuiltIn: {
    type: Boolean,
    default: false
  },

  installationDate: {
    type: Date,
    default: Date.now
  },

  // Estadísticas
  stats: {
    totalInstances: {
      type: Number,
      default: 0
    },
    activeInstances: {
      type: Number,
      default: 0
    },
    totalExecutions: {
      type: Number,
      default: 0
    },
    avgExecutionTime: {
      type: Number,
      default: 0
    },
    errors: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },

  // Metadatos adicionales
  metadata: {
    tags: [String],
    dependencies: [String],
    changelog: [{
      version: String,
      date: Date,
      changes: String
    }]
  }

}, {
  timestamps: true
});

// Índices
MiniAppSchema.index({ appId: 1 });
MiniAppSchema.index({ category: 1 });
MiniAppSchema.index({ enabled: 1 });
MiniAppSchema.index({ isBuiltIn: 1 });

module.exports = mongoose.model('MiniApp', MiniAppSchema);
