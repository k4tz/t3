#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';

const ENV_FILE = '.env';

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function readEnvFile() {
  try {
    return fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return '';
  }
}

function writeEnvFile(content) {
  try {
    fs.writeFileSync(ENV_FILE, content, 'utf8');
    console.log(`✅ Tokens added to ${ENV_FILE}`);
  } catch (error) {
    console.error('Error writing .env file:', error.message);
  }
}

// Generate tokens
const refresh = generateToken(64);
const access = generateToken(32);

// Read existing .env content
let envContent = readEnvFile();

// Add newline if content exists and doesn't end with newline
if (envContent && !envContent.endsWith('\n')) {
  envContent += '\n';
}

// Append tokens
envContent += `REFRESH_TOKEN_SECRET==${refresh}\n`;
envContent += `ACCESS_TOKEN_SECRET=${access}\n`;

// Write to file
writeEnvFile(envContent);

console.log('🎉 Generated JWT secrets');