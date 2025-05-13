import { neon } from '@neondatabase/serverless';

// Create a connection to the Neon database using the environment variable
const sql = neon(import.meta.env.VITE_DATABASE_URL || '');

/**
 * Adds a new comment to the database
 * @param comment The comment text to add
 * @returns Promise that resolves when the comment is added
 */
export const addComment = async (comment: string): Promise<void> => {
  try {
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
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
    const result = await sql`SELECT * FROM comments`;
    return result as Array<{ comment: string }>;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}; 