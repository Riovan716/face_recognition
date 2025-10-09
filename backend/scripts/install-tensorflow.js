import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Installing TensorFlow.js with Windows compatibility...');

try {
  // Set environment variables untuk mengatasi masalah Windows
  process.env.npm_config_build_from_source = 'true';
  process.env.npm_config_tfjs_binary_host = 'https://storage.googleapis.com/tensorflow/libtensorflow';
  
  // Install TensorFlow.js dengan flag khusus untuk Windows
  console.log('📦 Installing @tensorflow/tfjs...');
  execSync('npm install @tensorflow/tfjs@4.6.0 --no-optional', { stdio: 'inherit' });
  
  console.log('📦 Installing @tensorflow/tfjs-node...');
  execSync('npm install @tensorflow/tfjs-node@4.6.0 --no-optional', { stdio: 'inherit' });
  
  console.log('✅ TensorFlow.js installed successfully!');
  
} catch (error) {
  console.error('❌ Error installing TensorFlow.js:', error.message);
  console.log('🔄 Trying alternative installation method...');
  
  try {
    // Coba install dengan cara alternatif
    execSync('npm install @tensorflow/tfjs@4.6.0 --force', { stdio: 'inherit' });
    execSync('npm install @tensorflow/tfjs-node@4.6.0 --force', { stdio: 'inherit' });
    console.log('✅ TensorFlow.js installed with force flag!');
  } catch (altError) {
    console.error('❌ Alternative installation also failed:', altError.message);
    console.log('💡 Please try manual installation:');
    console.log('   npm install @tensorflow/tfjs@4.6.0');
    console.log('   npm install @tensorflow/tfjs-node@4.6.0');
  }
} 