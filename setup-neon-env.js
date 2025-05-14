/**
 * This script helps create the necessary .env.development.local file
 * for connecting to Neon Database.
 * 
 * Run this with: node setup-neon-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Neon Database Connection
VITE_DATABASE_URL=postgres://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# For uses requiring a connection without pgbouncer
# VITE_DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx.eu-central-1.aws.neon.tech/neondb?sslmode=require
`;

const envFilePath = path.join(__dirname, '.env.development.local');

// Create the .env.development.local file
fs.writeFile(envFilePath, envContent, (err) => {
  if (err) {
    console.error('Error creating .env.development.local file:', err);
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✓ .env.development.local file created successfully!');
  console.log('\x1b[36m%s\x1b[0m', 'Your Neon database connection is configured and ready to use.');
  console.log('\x1b[33m%s\x1b[0m', '\nReminder: Run the following SQL in your Neon Console:');
  console.log('\x1b[37m%s\x1b[0m', 'CREATE TABLE IF NOT EXISTS comments (comment TEXT);');
  console.log('\x1b[33m%s\x1b[0m', '\nThen start your app with:');
  console.log('\x1b[37m%s\x1b[0m', 'npm run dev\n');
}); 