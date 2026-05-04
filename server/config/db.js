const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI no definida. Server arranca sin DB.');
    return null;
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    console.log(`[DB] MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('[DB] Error de conexión:', err.message);
    // No tumbar el server, seguir sin DB
    return null;
  }
};

module.exports = connectDB;
