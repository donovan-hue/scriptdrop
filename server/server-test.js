// ═══════════════════════════════════════════════════════════════
// SERVIDOR DE PRUEBA SIMPLE - Para verificar que Node funciona
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: '✓ Server is running',
    timestamp: new Date(),
    port: PORT
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Backend is working!'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✓ Press Ctrl+C to stop`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('❌ Error:', err.message);
});

process.on('SIGINT', () => {
  console.log('\n✓ Server stopped');
  process.exit(0);
});
