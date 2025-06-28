#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment setup...\n');

// Check if backend dependencies exist
const backendNodeModules = path.join(process.cwd(), 'backend', 'node_modules');
const frontendNodeModules = path.join(process.cwd(), 'frontend', 'node_modules');

console.log('📁 Checking backend dependencies...');
if (fs.existsSync(backendNodeModules)) {
  console.log('✅ Backend node_modules found');
  
  // Check for express
  const expressPath = path.join(backendNodeModules, 'express');
  if (fs.existsSync(expressPath)) {
    console.log('✅ Express.js found in backend dependencies');
  } else {
    console.log('❌ Express.js not found in backend dependencies');
  }
} else {
  console.log('❌ Backend node_modules not found');
}

console.log('\n📁 Checking frontend dependencies...');
if (fs.existsSync(frontendNodeModules)) {
  console.log('✅ Frontend node_modules found');
} else {
  console.log('❌ Frontend node_modules not found');
}

// Check if frontend build exists
const frontendDist = path.join(process.cwd(), 'frontend', 'dist');
console.log('\n📁 Checking frontend build...');
if (fs.existsSync(frontendDist)) {
  console.log('✅ Frontend dist folder found');
  
  const indexHtml = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    console.log('✅ index.html found in frontend build');
  } else {
    console.log('❌ index.html not found in frontend build');
  }
} else {
  console.log('❌ Frontend dist folder not found');
}

console.log('\n🎯 Deployment verification complete!'); 