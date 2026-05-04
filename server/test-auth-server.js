// Test client para probar el servidor
const http = require('http');

function testServer() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✅ Server is responding!');
      console.log('Response:', data);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.log('❌ Server not responding:', e.message);
    process.exit(1);
  });

  req.end();
}

testServer();
