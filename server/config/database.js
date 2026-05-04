const mongoose = require('mongoose');

const RETRY_DELAY_MS = 30000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000
    });

    if (mongoose.connection.readyState === 1) {
      console.log('✓ MongoDB Connected:', mongoose.connection.host);
    } else {
      throw new Error('Connection established but readyState is not ready');
    }
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    console.error(`↻ Reintentando en ${RETRY_DELAY_MS / 1000}s. Revisa MONGODB_URI en .env`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected. Reintentando...');
  setTimeout(connectDB, RETRY_DELAY_MS);
});

module.exports = connectDB;
