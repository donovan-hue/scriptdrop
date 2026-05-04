// Verificador de estado - Comprueba si ambos servidores están activos
const http = require('http');

const tests = [
  { name: 'Backend API', url: 'http://localhost:5000/api/health', port: 5000 },
  { name: 'Frontend React', url: 'http://localhost:3000', port: 3000 }
];

let completed = 0;
let results = [];

function testServer(config) {
  return new Promise(resolve => {
    const startTime = Date.now();
    const request = http.get(config.url, { timeout: 3000 }, (response) => {
      const time = Date.now() - startTime;
      results.push({
        name: config.name,
        status: '✅ OK',
        code: response.statusCode,
        time: time + 'ms'
      });
      resolve();
    });

    request.on('error', (err) => {
      results.push({
        name: config.name,
        status: '❌ NO RESPONDE',
        error: err.code || err.message,
        time: '-'
      });
      resolve();
    });

    request.on('timeout', () => {
      request.destroy();
      results.push({
        name: config.name,
        status: '⏱️ TIMEOUT',
        error: 'Tardó más de 3 segundos',
        time: '3000+ms'
      });
      resolve();
    });
  });
}

async function checkAll() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('     🔍 VERIFICACIÓN DE SERVIDORES - ' + new Date().toLocaleTimeString());
  console.log('═══════════════════════════════════════════════════════\n');

  for (const test of tests) {
    process.stdout.write(`Probando ${test.name}... `);
    await testServer(test);
    process.stdout.write('✓\n');
  }

  console.log('\n───────────────────────────────────────────────────────');
  console.log('RESULTADOS:\n');
  
  results.forEach(r => {
    console.log(`${r.status}  ${r.name} (${r.time})`);
    if (r.code) console.log(`   └─ HTTP ${r.code}`);
    if (r.error) console.log(`   └─ ${r.error}`);
  });

  console.log('\n───────────────────────────────────────────────────────');
  
  const allOk = results.every(r => r.status === '✅ OK');
  if (allOk) {
    console.log('✅ TODOS LOS SERVIDORES FUNCIONAN CORRECTAMENTE\n');
    console.log('URLs disponibles:');
    console.log('  • Frontend: http://localhost:3000');
    console.log('  • Backend:  http://localhost:5000/api/health');
    console.log('  • Login:    http://localhost:3000/login');
    console.log('  • Register: http://localhost:3000/register\n');
  } else {
    console.log('⚠️  ALGUNOS SERVIDORES NO ESTÁN ACTIVOS\n');
    console.log('Inicia los servidores con:');
    console.log('  Terminal 1: cd server && node server-inmemory.js');
    console.log('  Terminal 2: cd client && npm start\n');
  }

  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(allOk ? 0 : 1);
}

checkAll();
