// Test script for our neonService
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// First try loading from .env
dotenv.config();

// If no connection string found, use the hardcoded one
if (!process.env.VITE_DATABASE_URL) {
  console.log('🔄 No .env file found, using hardcoded connection string');
  process.env.VITE_DATABASE_URL = 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
}

const connectionString = process.env.VITE_DATABASE_URL;
const sql = neon(connectionString);

/**
 * Adds a new comment to the database
 * @param comment The comment text to add
 * @returns Promise that resolves when the comment is added
 */
async function addComment(comment) {
  try {
    console.log('Adding comment to database:', comment);
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
    console.log('Comment added successfully');
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Retrieves all comments from the database
 * @returns Promise that resolves to an array of comments
 */
async function getComments() {
  try {
    console.log('Fetching comments from database');
    const result = await sql`SELECT * FROM comments`;
    console.log('Comments fetched successfully:', result.length);
    return result;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}

async function testNeonService() {
  try {
    console.log('🔄 Testing neonService...');
    
    // Test getting comments
    console.log('🔄 Getting existing comments...');
    const existingComments = await getComments();
    console.log(`✅ Retrieved ${existingComments.length} existing comments`);
    
    // Add a new comment
    const testComment = `Test comment at ${new Date().toISOString()}`;
    console.log(`🔄 Adding new comment: "${testComment}"`);
    await addComment(testComment);
    
    // Get comments again to verify the new one was added
    console.log('🔄 Getting updated comments...');
    const updatedComments = await getComments();
    console.log(`✅ Retrieved ${updatedComments.length} comments after adding`);
    
    // Check if our comment was added
    const found = updatedComments.some(comment => comment.comment === testComment);
    if (found) {
      console.log('✅ Successfully found our new comment!');
    } else {
      console.log('❌ Could not find our new comment!');
    }
    
    console.log('✅ neonService test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing neonService:', error);
  }
}

// Run the test
testNeonService().catch(err => {
  console.error('❌ Uncaught error:', err);
}); 