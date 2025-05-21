// CommonJS script for testing Neon connection
const { neon } = require('@neondatabase/serverless');

// Define the connection string directly
const connectionString = 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

console.log('Starting connection test...');
console.log('Using connection string:', connectionString);

// Create a connection to the Neon database
const sql = neon(connectionString);

async function testConnection() {
  try {
    console.log('Executing test query...');
    const result = await sql`SELECT 1 as test`;
    console.log('Connection successful!', result);
    
    console.log('Fetching tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Existing tables:');
    if (tables.length === 0) {
      console.log('No tables found.');
    } else {
      tables.forEach(t => console.log(` - ${t.table_name}`));
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testConnection(); 