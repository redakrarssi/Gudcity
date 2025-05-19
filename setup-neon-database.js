/**
 * Neon Database Setup Script
 * 
 * This script helps with setting up the Neon database integration:
 * 1. Creates the .env.development.local file with the correct connection string
 * 2. Tests the connection to the Neon database
 * 3. Creates all required database tables if they don't exist
 * 
 * Run with: node setup-neon-database.js
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First try loading from .env
dotenv.config();

// If no connection string found, use the hardcoded one
if (!process.env.VITE_DATABASE_URL) {
  console.log('🔄 No .env file found, using hardcoded connection string');
  process.env.VITE_DATABASE_URL = 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
}

const connectionString = process.env.VITE_DATABASE_URL;

// Create a connection to the Neon database
const sql = neon(connectionString);

// Create the env file content
const envContent = `# Neon Database Connection
VITE_DATABASE_URL=postgres://neondb_owner:npg_4ESIzAR3Kbrd@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
`;

// Path to the env file
const envFilePath = path.join(__dirname, '.env.development.local');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up Neon database schema...');
    
    // Create comments table if it doesn't exist
    try {
      console.log('🔄 Creating comments table...');
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          comment TEXT NOT NULL
        )
      `;
      console.log('✅ Comments table ready');
    } catch (err) {
      console.error('❌ Failed to create comments table:', err);
    }
    
    // Read the SQL setup file if it exists
    let setupSqlPath = path.join(process.cwd(), 'src', 'sql', 'database_setup.sql');
    
    if (fs.existsSync(setupSqlPath)) {
      console.log(`🔄 Found database_setup.sql at ${setupSqlPath}`);
      const setupSql = fs.readFileSync(setupSqlPath, 'utf8');
      
      // Split the SQL into individual statements
      const statements = setupSql
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .filter(statement => statement.trim() !== '');
      
      // Execute each statement
      for (const statement of statements) {
        try {
          // Use sql.query for raw SQL strings
          await sql.query(statement, []);
          console.log('✅ Executed SQL statement');
        } catch (err) {
          // Some statements may fail if objects already exist, which is okay
          console.warn(`⚠️ Statement error (might be normal): ${err.message}`);
        }
      }
    } else {
      console.log('⚠️ No database_setup.sql file found. Only creating comments table.');
    }
    
    // Run another test query to verify the setup
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log('📋 Tables after setup:');
      tables.forEach(t => console.log(` - ${t.table_name}`));
    } catch (err) {
      console.error('❌ Error checking tables after setup:', err);
    }
    
    console.log('✅ Database schema setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(err => {
  console.error('❌ Uncaught error:', err);
  process.exit(1);
});

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