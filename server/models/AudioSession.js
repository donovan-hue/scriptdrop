// Audio Session Model - Portal Kronos
const mongoose = require('mongoose');

const AudioSessionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioRoom',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: String,
      unique: true,
      required: true
    },
    // Estado de conexión
    status: {
      type: String,
      enum: ['connecting', 'connected', 'active', 'inactive', 'disconnected'],
      default: 'connecting'
    },
    // Audio
    microphoneEnabled: {
      type: Boolean,
      default: true
    },
    speakerEnabled: {
      type: Boolean,
      default: true
    },
    audioLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    // Localización en la sala (para audio espacial 3D)
    spatial: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    // Estadísticas de sesión
    duration: {
      type: Number,
      default: 0 // en segundos
    },
    messageCount: {
      type: Number,
      default: 0
    },
    noiseLevelAverage: {
      type: Number,
      default: 0
    },
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    latency: {
      type: Number,
      default: 0 // en ms
    },
    // Frecuencia personal
    frequency: {
      type: Number,
      default: 440 // Hz - puede variar por usuario
    },
    // Identidad visual en la sala
    avatar: String,
    username: String, // Cache del nombre del usuario
    color: {
      type: String,
      default: '#00FF88' // Color Sci-fi default (cyan)
    },
    // Permisos en la sala
    isModerator: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isDeafened: {
      type: Boolean,
      default: false
    },
    // Metadata
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String
    },
    ipAddress: String,
    // Eventos importantes
    lastActivity: Date,
    connectedAt: Date,
    disconnectedAt: Date
  },
  { timestamps: true }
);

// Index para búsqueda rápida
AudioSessionSchema.index({ room: 1, user: 1 });
AudioSessionSchema.index({ sessionId: 1 });
AudioSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AudioSession', AudioSessionSchema);
