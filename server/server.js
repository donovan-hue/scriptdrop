require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Security & performance middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Conectar a MongoDB (with timeout)
connectDB();

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Render corre detrás de un proxy — necesario para req.ip y rate limiting correctos
app.set('trust proxy', 1);

// Health check ANTES de cualquier middleware (rate limiter, auth, etc.)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    db: dbStatus,
    memory: process.memoryUsage().heapUsed,
    timestamp: new Date().toISOString()
  });
});

// Socket.io con CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// ============= SECURITY & PERFORMANCE MIDDLEWARE =============

// HTTP security headers
app.use(helmet());

// Gzip compression for all responses
app.use(compression());

// Request logging
app.use(morgan('combined'));

// General rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(generalLimiter);

// Auth-specific rate limit: 10 requests per hour (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again in an hour.' }
});
app.use('/api/auth', authLimiter);

// =============================================================

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));

// ── Stripe webhook: necesita el body en raw ANTES de express.json() ──
// Si el JSON parser corre primero, la firma de Stripe no se puede verificar.
const subscriptionRoutes = require('./routes/subscription');
app.post(
  '/api/subscription/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionRoutes.webhookHandler
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport (Google & Facebook OAuth) — inicializar sin sesiones (usamos JWT)
const passport = require('./config/passport');
app.use(passport.initialize());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/search', require('./routes/search'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/users', require('./routes/users'));
app.use('/api/multimedia', require('./routes/multimedia'));
app.use('/api/checkout', require('./routes/checkout')); // Stripe payment routes
app.use('/api/audio', require('./routes/audio')); // Portal Kronos - Spatial Audio
app.use('/api/translation', require('./routes/translation')); // Real-time Translation
app.use('/api/miniapps', require('./routes/miniApps')); // Mini-Apps Plugin System
app.use('/api/web3', require('./routes/web3')); // Web3 MetaMask Authentication
app.use('/api/tokens', require('./routes/tokens')); // Kronos Token - Attention Economy
app.use('/api/ar', require('./routes/ar')); // Augmented Reality
app.use('/api/delivery', require('./routes/delivery')); // Delivery Prediction & Optimization
app.use('/api/securechat', require('./routes/securechat')); // Secure Encrypted Chat
app.use('/api/stories', require('./routes/stories')); // Interactive Stories - Choose Your Own Adventure
app.use('/api/admin', require('./routes/admin')); // Admin Dashboard
app.use('/api/reporting', require('./routes/reporting')); // Report & Block System
app.use('/api/refunds', require('./routes/refunds')); // Refund Management
app.use('/api/twofactor', require('./routes/twofactor')); // 2FA Authentication
app.use('/api/videos', require('./routes/videos')); // Video Upload & Streaming
app.use('/api/recommendations', require('./routes/recommendations')); // Recommendation Engine + Virality
app.use('/api/tips', require('./routes/tips')); // Propinas Directas (Micro-transacciones)
app.use('/api/ai', require('./routes/ai')); // IA Generativa (OpenAI)
app.use('/api/blackhole', require('./routes/blackhole')); // Eventos Agujero Negro
app.use('/api/cinema', require('./routes/cinema')); // Cine Virtual Sincronizado
app.use('/api/sessions', require('./routes/sessions')); // Gestion de sesiones activas
app.use('/api/analytics', require('./routes/analytics')); // Metricas de atencion e interacciones
app.use('/api/interactions', require('./routes/interactions')); // Registro de interacciones de usuario
app.use('/api/food', require('./routes/food')); // Food - Restaurantes y pedidos
app.use('/api/subscription', subscriptionRoutes); // Kronos Pro / Suscripciones (Stripe)

// Initialize Socket.io singleton (para que controllers/routes puedan emitir eventos)
const socketService = require('./services/socketService');
socketService.init(io);

// Initialize AI Service
const aiService = require('./services/aiService');
aiService.init();


// ============= SOCKET.IO - CHAT EN TIEMPO REAL =============
const users = {}; // { userId: socketId }
const typingUsers = {}; // { userId: { socketId, username } }

io.on('connection', (socket) => {
  console.log('✓ New user connected:', socket.id);

  // Usuario se conecta
  socket.on('user_online', (userId) => {
    users[userId] = socket.id;
    socket.userId = userId;
    socketService.setUserOnline(userId, socket.id);
    io.emit('user_status', { userId, status: 'online', timestamp: new Date() });
  });

  // Enviar mensaje privado
  socket.on('send_private_message', (data) => {
    const { receiverId, content, senderId, senderUsername, timestamp } = data;

    if (users[receiverId]) {
      io.to(users[receiverId]).emit('receive_private_message', {
        senderId,
        senderUsername,
        content,
        timestamp,
        read: false
      });
    }

    // Guardar en base de datos (ya manejado por la ruta POST)
  });

  // Typing notification
  socket.on('typing', (data) => {
    const { receiverId, userId, username } = data;
    typingUsers[userId] = { socketId: socket.id, username };

    if (users[receiverId]) {
      io.to(users[receiverId]).emit('user_typing', {
        userId,
        username
      });
    }
  });

  socket.on('stop_typing', (data) => {
    const { receiverId, userId } = data;
    delete typingUsers[userId];

    if (users[receiverId]) {
      io.to(users[receiverId]).emit('user_stopped_typing', { userId });
    }
  });

  // ============= SOCKET.IO - FEED EN TIEMPO REAL =============

  // Usuario se suscribe al feed
  socket.on('subscribe_to_feed', (userId) => {
    socket.join(`feed_${userId}`);
  });

  // Nuevo post publicado (emit a seguidores)
  socket.on('post_created', (data) => {
    const { authorId, followersIds } = data;
    followersIds.forEach((followerId) => {
      io.to(`feed_${followerId}`).emit('new_post', data);
    });
  });

  // Nuevo like
  socket.on('post_liked', (data) => {
    const { postId, userId, authorId } = data;
    io.to(`feed_${authorId}`).emit('post_like_notification', {
      postId,
      userId,
      message: 'Someone liked your post'
    });
  });

  // Nuevo comentario
  socket.on('post_commented', (data) => {
    const { postId, authorId, commenterId } = data;
    io.to(`feed_${authorId}`).emit('post_comment_notification', {
      postId,
      commenterId,
      message: 'Someone commented on your post'
    });
  });

  // ============= SOCKET.IO - TRACKING DE ORDENES =============

  // Suscribirse al tracking de una orden
  socket.on('track_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  // Actualización de estado de orden
  socket.on('order_status_updated', (data) => {
    const { orderId, status, location, estimatedTime } = data;
    io.to(`order_${orderId}`).emit('order_status_change', {
      orderId,
      status,
      location,
      estimatedTime,
      timestamp: new Date()
    });
  });

  // ============= SOCKET.IO - NOTIFICACIONES =============

  // Notificación de nuevo seguidor
  socket.on('new_follower', (data) => {
    const { userId, followerId, followerUsername } = data;
    if (users[userId]) {
      io.to(users[userId]).emit('follower_notification', {
        followerId,
        followerUsername,
        message: `${followerUsername} started following you`
      });
    }
  });

  // ============= SOCKET.IO - PORTAL KRONOS (AUDIO ESPACIAL) =============

  const audioRooms = {}; // { roomId: { users: [{ userId, socketId, spatial: {} }] } }

  // Usuario se conecta a sala de audio
  socket.on('join_audio_room', (data) => {
    const { roomId, userId, username, sessionId } = data;

    if (!audioRooms[roomId]) {
      audioRooms[roomId] = { users: [] };
    }

    audioRooms[roomId].users.push({
      userId,
      username,
      socketId: socket.id,
      sessionId,
      spatial: { x: 0, y: 0, z: 0 }
    });

    socket.join(`audio_room_${roomId}`);

    // Notificar a otros usuarios
    io.to(`audio_room_${roomId}`).emit('user_joined_audio', {
      userId,
      username,
      totalUsers: audioRooms[roomId].users.length,
      sessionId
    });

    console.log(`✓ User ${username} joined audio room ${roomId}`);
  });

  // Actualizar posición espacial 3D
  socket.on('update_spatial_position', (data) => {
    const { roomId, userId, spatial } = data;

    if (audioRooms[roomId]) {
      const user = audioRooms[roomId].users.find(u => u.userId === userId);
      if (user) {
        user.spatial = spatial;
        io.to(`audio_room_${roomId}`).emit('spatial_position_updated', {
          userId,
          spatial,
          timestamp: new Date()
        });
      }
    }
  });

  // Audio data stream (para visualización de onda)
  socket.on('audio_stream', (data) => {
    const { roomId, userId, audioData } = data;
    io.to(`audio_room_${roomId}`).emit('receive_audio_stream', {
      userId,
      audioData,
      timestamp: new Date()
    });
  });

  // Usuario sale de sala de audio
  socket.on('leave_audio_room', (data) => {
    const { roomId, userId, username } = data;

    if (audioRooms[roomId]) {
      audioRooms[roomId].users = audioRooms[roomId].users.filter(u => u.userId !== userId);

      socket.leave(`audio_room_${roomId}`);

      io.to(`audio_room_${roomId}`).emit('user_left_audio', {
        userId,
        username,
        totalUsers: audioRooms[roomId].users.length
      });

      if (audioRooms[roomId].users.length === 0) {
        delete audioRooms[roomId];
      }
    }

    console.log(`✗ User ${username} left audio room ${roomId}`);
  });

  // Mute/Unmute en sala de audio
  socket.on('toggle_audio_mute', (data) => {
    const { roomId, userId, isMuted } = data;
    io.to(`audio_room_${roomId}`).emit('user_mute_changed', {
      userId,
      isMuted,
      timestamp: new Date()
    });
  });

  // ============= SOCKET.IO - CINE VIRTUAL SINCRONIZADO =============

  socket.on('join_cinema_room', ({ roomId, userId, username }) => {
    socket.join(`cinema_${roomId}`);
    socket.cinemaRoom = roomId;
    io.to(`cinema_${roomId}`).emit('cinema_user_joined', { userId, username });
  });

  socket.on('leave_cinema_room', ({ roomId, userId }) => {
    socket.leave(`cinema_${roomId}`);
    io.to(`cinema_${roomId}`).emit('cinema_user_left', { userId });
  });

  socket.on('cinema_sync', ({ roomId, currentTime, isPlaying }) => {
    socket.to(`cinema_${roomId}`).emit('cinema_sync', { currentTime, isPlaying });
  });

  socket.on('cinema_chat_message', ({ roomId, username, message }) => {
    socket.to(`cinema_${roomId}`).emit('cinema_chat', { username, message });
  });

  socket.on('cinema_reaction', ({ roomId, username, emoji }) => {
    socket.to(`cinema_${roomId}`).emit('cinema_reaction', { username, emoji });
  });

  // ============= SOCKET.IO - EVENTOS AGUJERO NEGRO =============

  socket.on('join_blackhole_event', ({ eventId, userId, username }) => {
    socket.join(`blackhole_${eventId}`);
    io.to(`blackhole_${eventId}`).emit('blackhole_user_joined', { userId, username });
  });

  socket.on('blackhole_update', ({ eventId, update }) => {
    io.to(`blackhole_${eventId}`).emit('blackhole_updated', update);
  });

  // Desconexión
  socket.on('disconnect', () => {
    socketService.setUserOffline(socket.id);
    Object.keys(users).forEach((userId) => {
      if (users[userId] === socket.id) {
        delete users[userId];
        io.emit('user_status', { userId, status: 'offline', timestamp: new Date() });
      }
    });

    Object.keys(typingUsers).forEach((userId) => {
      if (typingUsers[userId].socketId === socket.id) {
        delete typingUsers[userId];
      }
    });

    console.log('✗ User disconnected:', socket.id);
  });
});

// Manejo de errores centralizado
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Initialize Kronos Token Scheduler
const { scheduleRewardDistribution } = require('./services/scheduler');
if (process.env.NODE_ENV !== 'test') {
  scheduleRewardDistribution();
}

// Initialize Built-in Mini-Apps
const { initializeBuiltInApps } = require('./services/miniAppInitializer');
if (process.env.NODE_ENV !== 'test') {
  initializeBuiltInApps().catch(err => {
    console.error('Failed to initialize mini-apps:', err);
  });
}

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  🚀 Super-App Server Running          ║`);
  console.log(`║  Port: ${PORT}`);
  console.log(`║  URL: http://localhost:${PORT}`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

module.exports = { app, server, io };
