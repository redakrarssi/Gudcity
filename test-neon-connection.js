/**
 * This script tests the connection to your Neon database.
 * It requires the .env.development.local or .env.local file to be set up correctly.
 * 
 * Run this with: node test-neon-connection.js
 */

// Load environment variables from multiple possible files
import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading from .env.development.local first, then .env.local
if (fs.existsSync(path.join(__dirname, '.env.development.local'))) {
  console.log('Loading environment from .env.development.local');
  dotenv.config({ path: '.env.development.local' });
}

if (!process.env.VITE_DATABASE_URL && fs.existsSync(path.join(__dirname, '.env.local'))) {
  console.log('Loading environment from .env.local');
  dotenv.config({ path: '.env.local' });
}

// Check if the database URL is available
if (!process.env.VITE_DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: VITE_DATABASE_URL is not defined in your environment files');
  console.log('\x1b[33m%s\x1b[0m', 'Try running: node setup-neon-env.js');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
async function testConnection() {
  let client;
  
  try {
    console.log('\x1b[36m%s\x1b[0m', 'Testing connection to Neon database...');
    
    // Connect to the database
    client = await pool.connect();
    console.log('\x1b[32m%s\x1b[0m', '✓ Connected to Neon database successfully!');
    
    // Check if the comments table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'comments'
      );
    `);
    
    const tableExists = tableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('\x1b[32m%s\x1b[0m', '✓ Comments table exists!');
      
      // Count comments
      const countResult = await client.query('SELECT COUNT(*) FROM comments');
      const commentCount = parseInt(countResult.rows[0].count);
      
      console.log('\x1b[36m%s\x1b[0m', `There are currently ${commentCount} comments in the database.`);
    } else {
      console.log('\x1b[33m%s\x1b[0m', '! Comments table does not exist yet.');
      console.log('\x1b[37m%s\x1b[0m', 'Run the following SQL in your Neon Console:');
      console.log('\x1b[37m%s\x1b[0m', 'CREATE TABLE IF NOT EXISTS comments (comment TEXT);');
    }
    
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Error connecting to the database:');
    console.error(err.message);
  } finally {
    if (client) {
      client.release();
    }
    
    // Close the pool
    await pool.end();
  }
}

testConnection(); 