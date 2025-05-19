/**
 * Test script to verify Neon PostgreSQL tables
 * 
 * This script connects to the Neon database and lists all tables
 * It then tries to query each table to verify they were created properly
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Use the connection string from environment or fallback to hardcoded one
const connectionString = process.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Create the SQL connection
const sql = neon(connectionString);

async function testTables() {
  try {
    console.log('🔍 Testing database connection and tables...\n');
    
    // Get all tables in the public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Tables in database:');
    tables.forEach(table => console.log(` - ${table.table_name}`));
    console.log(`\nTotal tables found: ${tables.length}\n`);
    
    // Sample query for each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`🔍 Testing table: ${tableName}`);
      
      try {
        // Count records in the table - safely interpolating the table name
        const countQuery = `SELECT COUNT(*) AS count FROM "${tableName}"`;
        const countResult = await sql.query(countQuery);
        const count = parseInt(countResult.rows[0]?.count || '0');
        console.log(`   ✓ Records in ${tableName}: ${count}`);
        
        // Get column information
        const columns = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
          LIMIT 5
        `;
        
        console.log(`   ✓ Sample columns: ${columns.map(c => c.column_name).join(', ')}${columns.length >= 5 ? '...' : ''}\n`);
      } catch (error) {
        console.error(`   ❌ Error testing table ${tableName}:`, error.message);
      }
    }
    
    console.log('\n✅ Database tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
}

// Run the test function
testTables().catch(err => {
  console.error('❌ Uncaught error:', err);
  process.exit(1);
}); 