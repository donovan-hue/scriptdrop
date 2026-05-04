// Mini-App Initializer - Registers built-in mini-apps on server start
const MiniApp = require('../models/MiniApp');
const registry = require('./miniAppRegistry');

const BUILTIN_APPS = [
  {
    appId: 'calculator',
    name: 'Calculator',
    description: 'Simple arithmetic calculator with basic operations',
    icon: '🧮',
    color: '#00ff88',
    category: 'tools',
    componentPath: 'Calculator',
    isBuiltIn: true,
    config: {
      width: 400,
      height: 500,
      minWidth: 300,
      minHeight: 400,
      resizable: true,
      draggable: true
    },
    permissions: {
      requiresAuth: false,
      allowedFor: ['all'],
      features: ['calculate']
    },
    metadata: {
      tags: ['math', 'utility', 'tools'],
      dependencies: []
    }
  },
  {
    appId: 'timer',
    name: 'Timer & Stopwatch',
    description: 'Timer and stopwatch with multiple preset options',
    icon: '⏱️',
    color: '#ffaa00',
    category: 'productivity',
    componentPath: 'Timer',
    isBuiltIn: true,
    config: {
      width: 400,
      height: 450,
      minWidth: 300,
      minHeight: 350,
      resizable: true,
      draggable: true
    },
    permissions: {
      requiresAuth: false,
      allowedFor: ['all'],
      features: ['time']
    },
    metadata: {
      tags: ['time', 'productivity', 'utility'],
      dependencies: []
    }
  },
  {
    appId: 'weather',
    name: 'Weather',
    description: 'Real-time weather information and forecasts',
    icon: '🌤️',
    color: '#0088ff',
    category: 'tools',
    componentPath: 'Weather',
    isBuiltIn: true,
    config: {
      width: 400,
      height: 500,
      minWidth: 320,
      minHeight: 400,
      resizable: true,
      draggable: true
    },
    permissions: {
      requiresAuth: false,
      allowedFor: ['all'],
      features: ['location', 'weather']
    },
    metadata: {
      tags: ['weather', 'forecast', 'location'],
      dependencies: []
    }
  },
  {
    appId: 'stock',
    name: 'Stock Market',
    description: 'Track stocks and market data in real-time',
    icon: '📈',
    color: '#00ff88',
    category: 'tools',
    componentPath: 'Stock',
    isBuiltIn: true,
    config: {
      width: 600,
      height: 500,
      minWidth: 400,
      minHeight: 350,
      resizable: true,
      draggable: true
    },
    permissions: {
      requiresAuth: false,
      allowedFor: ['all'],
      features: ['market-data']
    },
    metadata: {
      tags: ['stocks', 'market', 'finance'],
      dependencies: []
    }
  },
  {
    appId: 'notes',
    name: 'Notes',
    description: 'Create and manage notes with local storage',
    icon: '📝',
    color: '#ff00ff',
    category: 'productivity',
    componentPath: 'Notes',
    isBuiltIn: true,
    config: {
      width: 600,
      height: 450,
      minWidth: 400,
      minHeight: 300,
      resizable: true,
      draggable: true
    },
    permissions: {
      requiresAuth: false,
      allowedFor: ['all'],
      features: ['storage']
    },
    metadata: {
      tags: ['notes', 'productivity', 'storage'],
      dependencies: []
    }
  },
  {
    appId: 'translator',
    name: 'Translator',
    description: 'Translate text between multiple languages',
    icon: '🌐',
    color: '#00ffaa',
    category: 'tools',
    componentPath: 'Translator',
    isBuiltIn: true,
    config: {
      width: 500,
      height: 500,
      minWidth: 350,
      minHeight: 400,
      resizable: true,
      draggable: true
    },
    permissions: {
      requiresAuth: false,
      allowedFor: ['all'],
      features: ['translate']
    },
    metadata: {
      tags: ['translation', 'language', 'tools'],
      dependencies: []
    }
  }
];

async function initializeBuiltInApps() {
  try {
    console.log('🔧 Initializing built-in mini-apps...');

    for (const appConfig of BUILTIN_APPS) {
      try {
        // Check if app already exists
        const existing = await MiniApp.findOne({ appId: appConfig.appId });

        if (!existing) {
          // Register new app
          await registry.register(appConfig);
          console.log(`  ✓ Registered: ${appConfig.name}`);
        } else {
          // Update existing app
          await MiniApp.updateOne(
            { appId: appConfig.appId },
            { $set: { ...appConfig, isBuiltIn: true } }
          );
          console.log(`  ✓ Updated: ${appConfig.name}`);
        }
      } catch (err) {
        console.error(`  ✗ Error with ${appConfig.name}:`, err.message);
      }
    }

    const total = await MiniApp.countDocuments();
    console.log(`✅ Mini-app initialization complete. Total apps: ${total}`);
  } catch (error) {
    console.error('✗ Error initializing built-in apps:', error);
  }
}

module.exports = {
  initializeBuiltInApps,
  BUILTIN_APPS
};
