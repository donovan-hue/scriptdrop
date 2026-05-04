#!/usr/bin/env node
/**
 * Validación del cliente React
 */

console.log('\n✅ Validando cliente React...\n');

let errors = [];

try {
  require('react');
  console.log('✅ react');
} catch (e) {
  errors.push('react');
}

try {
  require('react-dom');
  console.log('✅ react-dom');
} catch (e) {
  errors.push('react-dom');
}

try {
  require('react-router-dom');
  console.log('✅ react-router-dom');
} catch (e) {
  errors.push('react-router-dom');
}

try {
  require('axios');
  console.log('✅ axios');
} catch (e) {
  errors.push('axios');
}

try {
  require('socket.io-client');
  console.log('✅ socket.io-client');
} catch (e) {
  errors.push('socket.io-client');
}

try {
  require('zustand');
  console.log('✅ zustand');
} catch (e) {
  errors.push('zustand');
}

try {
  require('react-query');
  console.log('✅ react-query');
} catch (e) {
  errors.push('react-query');
}

try {
  require('tailwindcss');
  console.log('✅ tailwindcss');
} catch (e) {
  errors.push('tailwindcss');
}

try {
  require('framer-motion');
  console.log('✅ framer-motion');
} catch (e) {
  errors.push('framer-motion');
}

if (errors.length === 0) {
  console.log('\n✅ CLIENTE: TODO OK - Listo para npm start\n');
  process.exit(0);
} else {
  console.log(`\n❌ Errores: ${errors.join(', ')}\n`);
  process.exit(1);
}
