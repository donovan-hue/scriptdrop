// Quick test to verify everything loads
try {
  console.log('Loading server configuration...');
  require('dotenv').config();
  console.log('✅ Environment loaded');
  
  const express = require('express');
  console.log('✅ Express loaded');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded');
  
  // Try to require the server
  const server = require('./server.js');
  console.log('✅ Server module loaded');
  
  console.log('\n✅ ALL DEPENDENCIES VERIFIED - NO ERRORS\n');
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}
