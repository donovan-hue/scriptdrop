// Test file to check if dependencies load
console.log('=== INICIANDO PRUEBA ===');
console.log('Version de Node:', process.version);

try {
    console.log('1. Cargando dotenv...');
    require('dotenv').config();
    console.log('   ✅ dotenv cargado');
} catch (e) {
    console.log('   ❌ Error en dotenv:', e.message);
}

try {
    console.log('2. Cargando express...');
    const express = require('express');
    console.log('   ✅ express cargado');
} catch (e) {
    console.log('   ❌ Error en express:', e.message);
}

try {
    console.log('3. Cargando mongoose...');
    const mongoose = require('mongoose');
    console.log('   ✅ mongoose cargado');
} catch (e) {
    console.log('   ❌ Error en mongoose:', e.message);
}

try {
    console.log('4. Leyendo .env variables...');
    console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   PORT:', process.env.PORT || 5000);
    console.log('   ✅ Variables de entorno OK');
} catch (e) {
    console.log('   ❌ Error:', e.message);
}

console.log('\n=== PRUEBA COMPLETADA ===');
process.exit(0);
