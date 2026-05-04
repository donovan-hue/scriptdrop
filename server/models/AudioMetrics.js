// Audio Metrics Model - Portal Kronos
const mongoose = require('mongoose');

const AudioMetricsSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioRoom',
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioSession',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Metricas de audio
    audioMetrics: {
      peakLevel: Number,
      averageLevel: Number,
      noiseFloor: Number,
      frequency: Number,
      timbreFactor: Number
    },
    // Metricas de conexion
    connectionMetrics: {
      latency: Number, // ms
      packetLoss: Number, // %
      jitter: Number, // ms
      bandwidth: Number // kbps
    },
    // Metricas de CPU y memoria
    systemMetrics: {
      cpuUsage: Number, // %
      memoryUsage: Number, // %
      audioBufferHealth: Number // %
    },
    // Metricas de experiencia
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    // Eventos ocurridos
    events: [{
      type: {
        type: String,
        enum: ['connected', 'disconnected', 'audio_started', 'audio_stopped', 'muted', 'unmuted', 'quality_change']
      },
      timestamp: Date,
      details: mongoose.Schema.Types.Mixed
    }],
    // Timestamp del metric
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    // Intervalo de recolección
    interval: {
      type: Number,
      default: 5000 // ms
    }
  },
  { timestamps: true }
);

// TTL Index - eliminar metricas despues de 30 dias
AudioMetricsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Index para búsqueda rápida
AudioMetricsSchema.index({ room: 1, createdAt: -1 });
AudioMetricsSchema.index({ session: 1 });

module.exports = mongoose.model('AudioMetrics', AudioMetricsSchema);
