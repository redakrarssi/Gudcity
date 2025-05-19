// Script to create comments table in Neon database
import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';

// Load environment variables from the .env file
dotenv.config({ path: '.env.development.local' });

const databaseUrl = process.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: VITE_DATABASE_URL environment variable is not defined');
  process.exit(1);
}

const connectionDetails = {
  user: 'neondb_owner',
  password: 'npg_PZOYgSe82srL',
  host: 'ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech',
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
};

async function main() {
  // Create pool using connection string
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Neon database...');
    
    // Connect to the database
    const client = await pool.connect();
    console.log('✅ Connected to Neon database successfully!');
    
    // Check if the comments table exists
    const checkTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'comments'
      );
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Comments table already exists');
    } else {
      console.log('Creating comments table...');
      
      // Create the comments table
      await client.query(`CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`);
      
      console.log('✅ Comments table created successfully');
    }
    
    // Test the connection by inserting and querying a test comment
    console.log('Testing connection with a test comment...');
    await client.query(`INSERT INTO comments (comment) VALUES ('Test comment from setup script')`);
    
    const commentsResult = await client.query(`SELECT * FROM comments LIMIT 5`);
    console.log('Retrieved comments:', commentsResult.rows);
    
    console.log('✅ Database connection and setup successful!');

    // Release the client
    client.release();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

main(); 