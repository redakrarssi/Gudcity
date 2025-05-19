/**
 * This script tests the connection to your Neon database.
 * It requires the .env.development.local or .env.local file to be set up correctly.
 * 
 * Run this with: node test-neon-connection.js
 */

// Test script for verifying Neon database connection
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

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

async function testConnection() {
  try {
    console.log('🔄 Testing Neon database connection...');
    
    // Perform a simple query to test the connection
    const result = await sql`SELECT NOW() as current_time`;
    
    console.log('✅ Successfully connected to Neon database!');
    console.log(`✅ Current database time: ${result[0].current_time}`);
    
    // Check if essential tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Existing tables:');
    tables.forEach(t => console.log(` - ${t.table_name}`));
    
    // Check if comments table exists
    const commentTableExists = tables.some(t => t.table_name === 'comments');
    
    if (commentTableExists) {
      // Get the table structure
      const tableColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'comments'
      `;
      
      console.log('📊 Comments table structure:');
      tableColumns.forEach(col => console.log(` - ${col.column_name} (${col.data_type})`));
      
      // Count comments
      const commentsCount = await sql`SELECT COUNT(*) as count FROM comments`;
      console.log(`✅ Comments table exists with ${commentsCount[0].count} comment(s)`);
      
      // Get the last 5 comments - without using created_at since it might not exist
      const comments = await sql`SELECT * FROM comments LIMIT 5`;
      
      if (comments.length > 0) {
        console.log('📝 Sample comments:');
        comments.forEach(c => console.log(` - "${c.comment}"`));
      }
    } else {
      console.warn('⚠️ Comments table does not exist yet');
      
      // Try to create the comments table
      console.log('🔄 Creating comments table...');
      
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            comment TEXT NOT NULL
          )
        `;
        console.log('✅ Comments table created successfully!');
      } catch (createError) {
        console.error('❌ Failed to create comments table:', createError);
      }
    }
    
    console.log('✅ Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing database connection:', error);
    console.error(error);
  }
}

// Run the test
testConnection().catch(err => {
  console.error('❌ Uncaught error:', err);
}); 