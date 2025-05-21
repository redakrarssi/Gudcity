// Simple script to check database connection
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('VITE_DATABASE_URL exists:', !!process.env.VITE_DATABASE_URL);

const connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
console.log('Using connection string:', connectionString);

// Create a connection to the Neon database
const sql = neon(connectionString);

async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Connection successful!', result);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Existing tables:');
    tables.forEach(t => console.log(` - ${t.table_name}`));
    
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testConnection(); 