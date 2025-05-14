/**
 * Neon Database Setup Script
 * 
 * This script helps with setting up the Neon database integration:
 * 1. Creates the .env.development.local file with the correct connection string
 * 2. Tests the connection to the Neon database
 * 3. Attempts to create the comments table if it doesn't exist
 * 
 * Run with: node setup-neon-database.js
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.development.local' });

// Database connection details from the instructions
const connectionDetails = {
  user: 'neondb_owner',
  password: 'npg_4ESIzAR3Kbrd',
  host: 'ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech',
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
};

// Create the env file content
const envContent = `# Neon Database Connection
VITE_DATABASE_URL=postgres://neondb_owner:npg_4ESIzAR3Kbrd@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
`;

// Path to the env file
const envFilePath = path.join(__dirname, '.env.development.local');

// Steps to run
async function setup() {
  try {
    // STEP 1: Create the .env.development.local file
    console.log('\n📝 STEP 1: Creating environment file...');
    await createEnvFile();
    
    // STEP 2: Test the database connection
    console.log('\n🔌 STEP 2: Testing database connection...');
    const pool = new Pool({
      connectionString: `postgres://${connectionDetails.user}:${connectionDetails.password}@${connectionDetails.host}/${connectionDetails.database}?sslmode=require`,
      ssl: connectionDetails.ssl
    });
    
    // Connect to the database
    const client = await pool.connect();
    console.log('\x1b[32m%s\x1b[0m', '✓ Connected to Neon database successfully!');
    
    // STEP 3: Create the comments table if it doesn't exist
    console.log('\n🗄️ STEP 3: Setting up the comments table...');
    
    // Check if table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'comments'
      );
    `);
    
    const tableExists = tableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('\x1b[32m%s\x1b[0m', '✓ Comments table already exists!');
      
      // Count comments
      const countResult = await client.query('SELECT COUNT(*) FROM comments');
      const commentCount = parseInt(countResult.rows[0].count);
      
      console.log('\x1b[36m%s\x1b[0m', `There are currently ${commentCount} comments in the database.`);
    } else {
      // Create the table
      console.log('Creating comments table...');
      await client.query('CREATE TABLE IF NOT EXISTS comments (comment TEXT);');
      console.log('\x1b[32m%s\x1b[0m', '✓ Comments table created successfully!');
    }
    
    // Release the client and close the pool
    client.release();
    await pool.end();
    
    // STEP 4: Final instructions
    console.log('\n✅ SETUP COMPLETE!');
    console.log('\x1b[36m%s\x1b[0m', 'Your Neon database is now configured and ready to use.');
    console.log('\x1b[33m%s\x1b[0m', '\nStart your application with:');
    console.log('\x1b[37m%s\x1b[0m', 'npm run dev');
    console.log('\x1b[33m%s\x1b[0m', '\nVisit the demo page at:');
    console.log('\x1b[37m%s\x1b[0m', 'http://localhost:5173/neon-demo\n');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '\n❌ Setup failed:');
    console.error(error);
    process.exit(1);
  }
}

// Helper function to create the env file
function createEnvFile() {
  return new Promise((resolve, reject) => {
    // Check if file already exists
    if (fs.existsSync(envFilePath)) {
      console.log('\x1b[33m%s\x1b[0m', '! .env.development.local file already exists');
      console.log('Using existing environment file.');
      return resolve();
    }
    
    // Create the file
    fs.writeFile(envFilePath, envContent, (err) => {
      if (err) {
        return reject(new Error(`Failed to create .env.development.local file: ${err.message}`));
      }
      console.log('\x1b[32m%s\x1b[0m', '✓ .env.development.local file created successfully!');
      resolve();
    });
  });
}

// Run the setup
setup(); 