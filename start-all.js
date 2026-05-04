// Script para iniciar AMBOS servidores y verificar
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║         SUPER-APP - INICIADOR AUTOMÁTICO               ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Verificar archivos necesarios
const backend = 'e:\\kronos\\super-app\\server\\server-inmemory.js';
const frontend = 'e:\\kronos\\super-app\\client\\package.json';

console.log('🔍 Verificando archivos...\n');

if (!fs.existsSync(backend)) {
  console.log('❌ Backend no encontrado:', backend);
  process.exit(1);
}
console.log('✓ Backend: OK');

if (!fs.existsSync(frontend)) {
  console.log('❌ Frontend no encontrado:', frontend);
  process.exit(1);
}
console.log('✓ Frontend: OK\n');

console.log('═════════════════════════════════════════════════════════');
console.log('Iniciando servidores...\n');

// Iniciar Backend
console.log('🚀 Backend: Iniciando en puerto 5000...');
const backendProcess = spawn('node', [backend], {
  cwd: 'e:\\kronos\\super-app\\server',
  shell: true,
  stdio: 'pipe'
});

let backendStarted = false;
backendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Server running')) {
    if (!backendStarted) {
      console.log('✅ Backend: ACTIVO en puerto 5000\n');
      backendStarted = true;
    }
  }
});

// Iniciar Frontend
setTimeout(() => {
  console.log('🚀 Frontend: Iniciando en puerto 3000...');
  console.log('   (Esto puede tardar 30-60 segundos en comprender)\n');
  
  const frontendProcess = spawn('npm', ['start'], {
    cwd: 'e:\\kronos\\super-app\\client',
    shell: true,
    stdio: 'pipe'
  });

  let frontendStarted = false;
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if ((output.includes('Compiled successfully') || output.includes('localhost:3000')) && !frontendStarted) {
      console.log('✅ Frontend: ACTIVO en puerto 3000\n');
      frontendStarted = true;
      showFinal();
    }
  });

  frontendProcess.stderr.on('data', (data) => {
    // Ignorar warnings de webpack
    const output = data.toString();
    if (output.includes('warning')) return;
    console.log('[Frontend] ' + output);
  });

}, 2000);

function showFinal() {
  console.log('═════════════════════════════════════════════════════════\n');
  console.log('✅ ¡PROYECTO LISTO!\n');
  console.log('Acceso:');
  console.log('  • FRONTEND: http://localhost:3000');
  console.log('  • BACKEND:  http://localhost:5000/api/health\n');
  console.log('Acciones:');
  console.log('  • Registrarse: http://localhost:3000/register');
  console.log('  • Login:       http://localhost:3000/login\n');
  console.log('═════════════════════════════════════════════════════════\n');
}
