const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Check if required directories exist
const requiredDirs = ['frontend', 'electron'];
for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Required directory '${dir}' not found!`);
    process.exit(1);
  }
}

// Check if package.json files exist
const requiredFiles = ['frontend/package.json', 'package.json'];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file '${file}' not found!`);
    process.exit(1);
  }
}

try {
  // Install dependencies for frontend
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
  
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build frontend
  console.log('🔨 Building frontend...');
  execSync('npm run build', { cwd: 'frontend', stdio: 'inherit' });
  
  // Check if frontend build was successful
  if (!fs.existsSync('frontend/dist')) {
    throw new Error('Frontend build failed - dist folder not found');
  }
  
  console.log('✅ Build completed successfully!');
  console.log('🎯 You can now run: npm run build:win');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
