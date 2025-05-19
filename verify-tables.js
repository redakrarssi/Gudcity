/**
 * Simple script to verify Neon PostgreSQL tables exist
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the connection string from environment or fallback to hardcoded one
const connectionString = process.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Create the SQL connection
const sql = neon(connectionString);

async function verifyTables() {
  try {
    console.log('🔍 Verifying database tables...\n');
    
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
    
    // Check for our specific tables
    const requiredTables = [
      'users',
      'businesses',
      'customers',
      'loyalty_programs',
      'loyalty_cards',
      'transactions',
      'rewards',
      'settings',
      'redemption_codes',
      'qr_codes',
      'comments'
    ];
    
    console.log('🔍 Checking for required tables:');
    
    const tableNames = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing required tables:', missingTables.join(', '));
    } else {
      console.log('✅ All required tables exist!');
    }
    
    // Try inserting a test record into the comments table
    try {
      console.log('\n🔍 Testing comments table with a test record...');
      
      // Insert a test comment
      const testComment = `Test comment ${new Date().toISOString()}`;
      await sql`INSERT INTO comments (comment) VALUES (${testComment})`;
      console.log('✅ Successfully inserted a test comment');
      
      // Retrieve comments to make sure it worked - don't rely on ID column
      const comments = await sql`SELECT comment FROM comments LIMIT 5`;
      console.log('✅ Retrieved recent comments:');
      comments.forEach((comment, i) => {
        console.log(` - Comment ${i + 1}: ${comment.comment}`);
      });
    } catch (error) {
      console.error('❌ Error testing comments table:', error.message);
    }
    
    // Get some info about the structure of the table
    try {
      console.log('\n🔍 Getting columns for comments table:');
      const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'comments'
      `;
      
      console.log('✅ Comments table structure:');
      columns.forEach(col => {
        console.log(` - ${col.column_name} (${col.data_type})`);
      });
    } catch (error) {
      console.error('❌ Error getting comments table structure:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
}

// Run the verify function
verifyTables().catch(err => {
  console.error('❌ Uncaught error:', err);
  process.exit(1);
}); 