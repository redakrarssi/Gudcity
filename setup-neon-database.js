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

// Read the SQL script from the project
const readSqlScript = () => {
  try {
    const sqlFilePath = path.join(__dirname, 'src', 'sql', 'database_setup.sql');
    if (fs.existsSync(sqlFilePath)) {
      return fs.readFileSync(sqlFilePath, 'utf8');
    } else {
      console.warn('\x1b[33m%s\x1b[0m', '! SQL script not found in src/sql/database_setup.sql');
      return null;
    }
  } catch (error) {
    console.error('Error reading SQL script:', error);
    return null;
  }
};

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
    
    // STEP 3: Create all necessary tables if they don't exist
    console.log('\n🗄️ STEP 3: Setting up database tables...');
    
    // Define the required tables
    const requiredTables = [
      'users', 'businesses', 'customers', 'loyalty_programs', 
      'transactions', 'rewards', 'loyalty_cards', 'settings',
      'redemption_codes', 'qr_codes'
    ];
    
    // Get existing tables
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tableResult.rows.map(row => row.table_name);
    console.log('\x1b[36m%s\x1b[0m', `Found ${existingTables.length} existing tables: ${existingTables.join(', ') || 'none'}`);
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      console.log('\x1b[33m%s\x1b[0m', `Tables need to be created: ${missingTables.join(', ')}`);
      
      // Try to use the SQL script from the project
      const sqlScript = readSqlScript();
      if (sqlScript) {
        console.log('\x1b[36m%s\x1b[0m', 'Executing database setup SQL script...');
        await client.query(sqlScript);
        console.log('\x1b[32m%s\x1b[0m', '✓ Database tables created successfully from SQL script!');
      } else {
        // Create tables manually if SQL script not found
        console.log('\x1b[36m%s\x1b[0m', 'Creating tables manually...');
        
        // Create UUID extension if it doesn't exist
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        
        // Create businesses table
        if (!existingTables.includes('businesses')) {
          await client.query(`
            CREATE TABLE businesses (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR(255) NOT NULL,
              owner_id UUID,
              address TEXT,
              phone VARCHAR(50),
              email VARCHAR(255),
              website VARCHAR(255),
              description TEXT,
              logo_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created businesses table');
        }
        
        // Create users table
        if (!existingTables.includes('users')) {
          await client.query(`
            CREATE TABLE users (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              email VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              first_name VARCHAR(100),
              last_name VARCHAR(100),
              business_id UUID,
              role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'customer')),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created users table');
        }
        
        // Create customers table
        if (!existingTables.includes('customers')) {
          await client.query(`
            CREATE TABLE customers (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES users(id) ON DELETE CASCADE,
              business_id UUID,
              first_name VARCHAR(100),
              last_name VARCHAR(100),
              email VARCHAR(255),
              phone VARCHAR(50),
              address TEXT,
              sign_up_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              total_points INTEGER DEFAULT 0,
              birthday DATE,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created customers table');
        }
        
        // Create loyalty_programs table
        if (!existingTables.includes('loyalty_programs')) {
          await client.query(`
            CREATE TABLE loyalty_programs (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID,
              name VARCHAR(255) NOT NULL,
              type VARCHAR(20) NOT NULL CHECK (type IN ('points', 'punchcard', 'tiered')),
              description TEXT,
              rules JSONB,
              active BOOLEAN DEFAULT true,
              start_date TIMESTAMP WITH TIME ZONE,
              end_date TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created loyalty_programs table');
        }
        
        // Create transactions table
        if (!existingTables.includes('transactions')) {
          await client.query(`
            CREATE TABLE transactions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID,
              customer_id UUID,
              program_id UUID,
              amount NUMERIC(10, 2),
              points_earned INTEGER,
              date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'refund', 'reward_redemption')),
              staff_id UUID,
              notes TEXT,
              receipt_number VARCHAR(50),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created transactions table');
        }
        
        // Create rewards table
        if (!existingTables.includes('rewards')) {
          await client.query(`
            CREATE TABLE rewards (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID,
              program_id UUID,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              points_required INTEGER NOT NULL,
              active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created rewards table');
        }
        
        // Create loyalty_cards table
        if (!existingTables.includes('loyalty_cards')) {
          await client.query(`
            CREATE TABLE loyalty_cards (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID,
              customer_id UUID,
              program_id UUID,
              points_balance INTEGER DEFAULT 0,
              punch_count INTEGER,
              tier VARCHAR(50),
              issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              expiry_date TIMESTAMP WITH TIME ZONE,
              active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created loyalty_cards table');
        }
        
        // Create settings table
        if (!existingTables.includes('settings')) {
          await client.query(`
            CREATE TABLE settings (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID,
              category VARCHAR(100) NOT NULL,
              settings_data JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created settings table');
        }
        
        // Create redemption_codes table
        if (!existingTables.includes('redemption_codes')) {
          await client.query(`
            CREATE TABLE redemption_codes (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID NOT NULL,
              code VARCHAR(50) UNIQUE NOT NULL,
              reward_id UUID,
              value_type VARCHAR(20) NOT NULL CHECK (value_type IN ('points', 'discount', 'product')),
              value_amount NUMERIC(10, 2),
              is_used BOOLEAN DEFAULT false,
              used_by UUID,
              used_at TIMESTAMP WITH TIME ZONE,
              expires_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created redemption_codes table');
        }
        
        // Create qr_codes table
        if (!existingTables.includes('qr_codes')) {
          await client.query(`
            CREATE TABLE qr_codes (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              business_id UUID NOT NULL,
              content TEXT NOT NULL,
              link_url TEXT,
              code_type VARCHAR(50) NOT NULL CHECK (code_type IN ('loyalty', 'product', 'promotion', 'payment')),
              scans_count INTEGER DEFAULT 0,
              unique_scans_count INTEGER DEFAULT 0,
              description TEXT,
              metadata JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          console.log('\x1b[32m%s\x1b[0m', '✓ Created qr_codes table');
        }
        
        // Add Foreign Keys
        await client.query(`
          ALTER TABLE users 
          ADD CONSTRAINT fk_users_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE SET NULL;
          
          ALTER TABLE customers 
          ADD CONSTRAINT fk_customers_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE loyalty_programs 
          ADD CONSTRAINT fk_programs_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE transactions 
          ADD CONSTRAINT fk_transactions_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE transactions 
          ADD CONSTRAINT fk_transactions_customer 
          FOREIGN KEY (customer_id) 
          REFERENCES customers(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE transactions 
          ADD CONSTRAINT fk_transactions_program 
          FOREIGN KEY (program_id) 
          REFERENCES loyalty_programs(id) 
          ON DELETE SET NULL;
          
          ALTER TABLE transactions 
          ADD CONSTRAINT fk_transactions_staff 
          FOREIGN KEY (staff_id) 
          REFERENCES users(id) 
          ON DELETE SET NULL;
          
          ALTER TABLE rewards 
          ADD CONSTRAINT fk_rewards_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE rewards 
          ADD CONSTRAINT fk_rewards_program 
          FOREIGN KEY (program_id) 
          REFERENCES loyalty_programs(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE loyalty_cards 
          ADD CONSTRAINT fk_loyalty_cards_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE loyalty_cards 
          ADD CONSTRAINT fk_loyalty_cards_customer 
          FOREIGN KEY (customer_id) 
          REFERENCES customers(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE loyalty_cards 
          ADD CONSTRAINT fk_loyalty_cards_program 
          FOREIGN KEY (program_id) 
          REFERENCES loyalty_programs(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE settings 
          ADD CONSTRAINT fk_settings_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE redemption_codes 
          ADD CONSTRAINT fk_redemption_codes_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
          
          ALTER TABLE redemption_codes 
          ADD CONSTRAINT fk_redemption_codes_reward 
          FOREIGN KEY (reward_id) 
          REFERENCES rewards(id) 
          ON DELETE SET NULL;
          
          ALTER TABLE qr_codes 
          ADD CONSTRAINT fk_qr_codes_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE;
        `);
        
        console.log('\x1b[32m%s\x1b[0m', '✓ Added foreign key constraints');
        
        // Add indexes for performance
        await client.query(`
          CREATE INDEX idx_users_email ON users(email);
          CREATE INDEX idx_users_business_id ON users(business_id);
          CREATE INDEX idx_customers_business_id ON customers(business_id);
          CREATE INDEX idx_customers_user_id ON customers(user_id);
          CREATE INDEX idx_loyalty_programs_business_id ON loyalty_programs(business_id);
          CREATE INDEX idx_transactions_business_id ON transactions(business_id);
          CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
          CREATE INDEX idx_transactions_program_id ON transactions(program_id);
          CREATE INDEX idx_rewards_business_id ON rewards(business_id);
          CREATE INDEX idx_rewards_program_id ON rewards(program_id);
          CREATE INDEX idx_loyalty_cards_customer_id ON loyalty_cards(customer_id);
          CREATE INDEX idx_loyalty_cards_program_id ON loyalty_cards(program_id);
          CREATE INDEX idx_loyalty_cards_business_id ON loyalty_cards(business_id);
          CREATE INDEX idx_settings_business_id ON settings(business_id);
          CREATE INDEX idx_redemption_codes_business_id ON redemption_codes(business_id);
          CREATE INDEX idx_redemption_codes_code ON redemption_codes(code);
          CREATE INDEX idx_qr_codes_business_id ON qr_codes(business_id);
        `);
        
        console.log('\x1b[32m%s\x1b[0m', '✓ Created database indexes');
      }
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✓ All required tables already exist!');
    }
    
    // Release the client and close the pool
    client.release();
    await pool.end();
    
    // STEP 4: Final instructions
    console.log('\n✅ SETUP COMPLETE!');
    console.log('\x1b[36m%s\x1b[0m', 'Your Neon database is now configured and ready to use.');
    console.log('\x1b[33m%s\x1b[0m', '\nStart your application with:');
    console.log('\x1b[37m%s\x1b[0m', 'npm run dev');
    
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