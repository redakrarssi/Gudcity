// CommonJS script for setting up database tables
const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get the DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
console.log('Using connection string:', connectionString);

// Create a connection to the Neon database
const sql = neon(connectionString);

async function setupTables() {
  try {
    console.log('Setting up database tables...');

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

    // List all tables to confirm setup
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Tables in database:');
    tables.forEach(t => console.log(` - ${t.table_name}`));

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupTables(); 