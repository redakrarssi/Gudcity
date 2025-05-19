import { neon } from '@neondatabase/serverless';

// Log the connection string (without showing sensitive info)
console.log('Database URL exists:', !!import.meta.env.VITE_DATABASE_URL);

// Create a connection to the Neon database
// Use a hardcoded connection string for testing if the environment variable is missing or malformed
const connectionString = import.meta.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Create a connection to the Neon database using the connection string
const sql = neon(connectionString);

/**
 * Adds a new comment to the database
 * @param comment The comment text to add
 * @returns Promise that resolves when the comment is added
 */
export const addComment = async (comment: string): Promise<void> => {
  try {
    console.log('Adding comment to database:', comment);
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
    console.log('Comment added successfully');
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Retrieves all comments from the database
 * @returns Promise that resolves to an array of comments
 */
export const getComments = async (): Promise<Array<{ comment: string }>> => {
  try {
    console.log('Fetching comments from database');
    // No ORDER BY clause since created_at might not exist
    const result = await sql`SELECT * FROM comments`;
    console.log('Comments fetched successfully:', result.length);
    return result as Array<{ comment: string }>;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}; 