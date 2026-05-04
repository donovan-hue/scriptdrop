#!/usr/bin/env node
/**
 * VALIDACIÓN FINAL DEL PROYECTO
 * Verifica que todas las dependencias y código cargan correctamente
 */

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║     VALIDACIÓN FINAL DEL PROYECTO SUPER-APP              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let errors = [];
let successes = [];

// Test 1: Cargar dotenv
try {
  require('dotenv').config();
  successes.push('✅ dotenv cargado');
} catch (e) {
  errors.push(`❌ dotenv: ${e.message}`);
}

// Test 2: Cargar express
try {
  require('express');
  successes.push('✅ express cargado');
} catch (e) {
  errors.push(`❌ express: ${e.message}`);
}

// Test 3: Cargar mongoose
try {
  require('mongoose');
  successes.push('✅ mongoose cargado');
} catch (e) {
  errors.push(`❌ mongoose: ${e.message}`);
}

// Test 4: Cargar socket.io
try {
  require('socket.io');
  successes.push('✅ socket.io cargado');
} catch (e) {
  errors.push(`❌ socket.io: ${e.message}`);
}

// Test 5: Cargar bcryptjs
try {
  require('bcryptjs');
  successes.push('✅ bcryptjs cargado');
} catch (e) {
  errors.push(`❌ bcryptjs: ${e.message}`);
}

// Test 6: Cargar jsonwebtoken
try {
  require('jsonwebtoken');
  successes.push('✅ jsonwebtoken cargado');
} catch (e) {
  errors.push(`❌ jsonwebtoken: ${e.message}`);
}

// Test 7: Cargar stripe
try {
  require('stripe');
  successes.push('✅ stripe cargado');
} catch (e) {
  errors.push(`❌ stripe: ${e.message}`);
}

// Test 8: Cargar cloudinary
try {
  require('cloudinary');
  successes.push('✅ cloudinary cargado');
} catch (e) {
  errors.push(`❌ cloudinary: ${e.message}`);
}

// Test 9: Cargar axios
try {
  require('axios');
  successes.push('✅ axios cargado');
} catch (e) {
  errors.push(`❌ axios: ${e.message}`);
}

// Test 10: Verificar .env variables
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI no configurada');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no configurada');
  successes.push('✅ Variables de entorno configuradas');
} catch (e) {
  errors.push(`❌ Env vars: ${e.message}`);
}

// Test 11: Cargar un modelo
try {
  require('./models/User.js');
  successes.push('✅ Modelo User cargado');
} catch (e) {
  errors.push(`❌ Modelo User: ${e.message}`);
}

// Test 12: Cargar un controlador
try {
  require('./controllers/authController.js');
  successes.push('✅ Controlador auth cargado');
} catch (e) {
  errors.push(`❌ Controlador auth: ${e.message}`);
}

// Test 13: Cargar una ruta
try {
  require('./routes/auth.js');
  successes.push('✅ Ruta auth cargada');
} catch (e) {
  errors.push(`❌ Ruta auth: ${e.message}`);
}

// Mostrar resultados
console.log('RESULTADOS:\n');

successes.forEach(s => console.log(s));

if (errors.length > 0) {
  console.log('\nERRORES ENCONTRADOS:\n');
  errors.forEach(e => console.log(e));
} else {
  console.log('\n✅ NO HAY ERRORES - TODO FUNCIONA CORRECTAMENTE\n');
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log(`║ Verificaciones totales: ${successes.length + errors.length}                                     ║`);
console.log(`║ Exitosas: ${successes.length}                                               ║`);
console.log(`║ Errores: ${errors.length}                                                 ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

process.exit(errors.length > 0 ? 1 : 0);
