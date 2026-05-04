// Audio Room Model - Portal Kronos
const mongoose = require('mongoose');

const AudioRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    theme: {
      type: String,
      enum: ['kronos-sci-fi', 'cosmic', 'nebula', 'quantum', 'portal'],
      default: 'kronos-sci-fi'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    capacity: {
      type: Number,
      default: 50,
      min: 1,
      max: 500
    },
    currentUsers: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    audioFormat: {
      type: String,
      enum: ['stereo', 'surround', 'spatial-3d'],
      default: 'spatial-3d'
    },
    bitrate: {
      type: Number,
      enum: [64, 128, 192, 256, 320],
      default: 192
    },
    // Metricas de la sala
    totalSessions: {
      type: Number,
      default: 0
    },
    averageDuration: {
      type: Number,
      default: 0 // en minutos
    },
    peakUsers: {
      type: Number,
      default: 0
    },
    // Configuracion avanzada
    isPrivate: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      select: false
    },
    tags: [String],
    language: {
      type: String,
      default: 'es'
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    // Frecuencia base para efecto sci-fi
    frequency: {
      type: Number,
      default: 440 // Hz
    },
    // Visualización sci-fi
    visualEffect: {
      type: String,
      enum: ['waveform', 'particles', 'galaxy', 'quantum-field'],
      default: 'galaxy'
    }
  },
  { timestamps: true }
);

// Index untuk pencarian cepat
AudioRoomSchema.index({ name: 'text', description: 'text' });
AudioRoomSchema.index({ owner: 1 });
AudioRoomSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AudioRoom', AudioRoomSchema);
