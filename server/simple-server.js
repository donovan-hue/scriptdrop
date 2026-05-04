// ═══════════════════════════════════════════════════════════════
// SERVIDOR NATIVO - Sin dependencias, solo Node.js
// ═══════════════════════════════════════════════════════════════

const http = require('http');

const PORT = 5000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: '✓ Server is running',
      timestamp: new Date(),
      port: PORT
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✓ Press Ctrl+C to stop`);
});

process.on('SIGINT', () => {
  console.log('\n✓ Server stopped');
  process.exit(0);
});
