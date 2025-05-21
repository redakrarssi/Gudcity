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
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get the DATABASE_URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables. Please set it before running this script.');
  process.exit(1);
}

// Create a connection to the Neon database
const sql = neon(DATABASE_URL);

// Create the env file content
const envContent = `# Neon Database Connection
VITE_DATABASE_URL=postgres://neondb_owner:npg_4ESIzAR3Kbrd@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
`;

// Path to the env file
const envFilePath = path.join(__dirname, '.env.development.local');

async function setupDatabase() {
  try {
    console.log('Setting up Neon PostgreSQL database...');

    // Create comments table
        await sql`
          CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Comments table created or already exists');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        business_id UUID,
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'staff', 'customer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table created or already exists');

    // Create businesses table
    await sql`
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        description TEXT,
        logo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Businesses table created or already exists');

    // Add foreign key constraint to users table for business_id
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_business_id_fkey'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_business_id_fkey 
          FOREIGN KEY (business_id) REFERENCES businesses(id);
        END IF;
      END
      $$;
    `;
    console.log('Foreign key constraint added to users table');

    // Add foreign key constraint to businesses table for owner_id
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'businesses_owner_id_fkey'
        ) THEN
          ALTER TABLE businesses ADD CONSTRAINT businesses_owner_id_fkey 
          FOREIGN KEY (owner_id) REFERENCES users(id);
        END IF;
      END
      $$;
    `;
    console.log('Foreign key constraint added to businesses table');

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        business_id UUID,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        sign_up_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        total_points INTEGER DEFAULT 0,
        birthday DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Customers table created or already exists');

    // Add foreign keys to customers table
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'customers_user_id_fkey'
        ) THEN
          ALTER TABLE customers ADD CONSTRAINT customers_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'customers_business_id_fkey'
        ) THEN
          ALTER TABLE customers ADD CONSTRAINT customers_business_id_fkey 
          FOREIGN KEY (business_id) REFERENCES businesses(id);
        END IF;
      END
      $$;
    `;
    console.log('Foreign key constraints added to customers table');

    // Create qr_codes table
    await sql`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID,
        content TEXT NOT NULL,
        link_url TEXT,
        code_type VARCHAR(20) NOT NULL CHECK (code_type IN ('loyalty', 'product', 'promotion', 'payment')),
        scans_count INTEGER DEFAULT 0,
        unique_scans_count INTEGER DEFAULT 0,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('QR codes table created or already exists');

    // Add foreign key to qr_codes table
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'qr_codes_business_id_fkey'
        ) THEN
          ALTER TABLE qr_codes ADD CONSTRAINT qr_codes_business_id_fkey 
          FOREIGN KEY (business_id) REFERENCES businesses(id);
        END IF;
      END
      $$;
    `;
    console.log('Foreign key constraint added to qr_codes table');

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();

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