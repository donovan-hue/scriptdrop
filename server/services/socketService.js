/**
 * socketService.js
 * Singleton para acceder a la instancia de Socket.io desde cualquier controller/route.
 *
 * Uso:
 *   const { getIO, getSocketId, setUserOnline, setUserOffline } = require('./services/socketService');
 *   const io = getIO();
 *   const socketId = getSocketId(userId);
 *   if (socketId) io.to(socketId).emit('notification', data);
 */

let _io = null;

// Mapa userId -> socketId (misma estructura que en server.js)
const _onlineUsers = {}; // { userId: socketId }

/**
 * Inicializar con la instancia de io creada en server.js
 * @param {import('socket.io').Server} io
 */
exports.init = (io) => {
  _io = io;
};

/**
 * Retorna la instancia de io.
 * Lanza error si todavía no fue inicializado.
 */
exports.getIO = () => {
  if (!_io) {
    throw new Error('Socket.io not initialized — call socketService.init(io) first');
  }
  return _io;
};

/**
 * Registra que un usuario está online con su socketId
 */
exports.setUserOnline = (userId, socketId) => {
  _onlineUsers[userId.toString()] = socketId;
};

/**
 * Registra que un usuario se desconectó
 */
exports.setUserOffline = (socketId) => {
  Object.keys(_onlineUsers).forEach((uid) => {
    if (_onlineUsers[uid] === socketId) {
      delete _onlineUsers[uid];
    }
  });
};

/**
 * Retorna el socketId de un usuario si está online, o null si no lo está.
 */
exports.getSocketId = (userId) => {
  return _onlineUsers[userId.toString()] || null;
};

/**
 * Emite un evento de notificación directamente al usuario si está conectado.
 * @param {string} userId - ID del usuario destinatario
 * @param {object} payload - Datos de la notificación
 */
exports.emitNotification = (userId, payload) => {
  if (!_io) return;
  const socketId = _onlineUsers[userId.toString()];
  if (socketId) {
    _io.to(socketId).emit('notification', {
      ...payload,
      timestamp: new Date()
    });
  }
};
