import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database using the environment variable
const sql = neon(process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET request - fetch all comments
    if (req.method === 'GET') {
      const comments = await sql`SELECT * FROM comments ORDER BY created_at DESC`;
      return res.status(200).json(comments);
    }
    
    // POST request - add a new comment
    if (req.method === 'POST') {
      const { comment } = req.body;
      
      if (!comment) {
        return res.status(400).json({ error: 'Comment text is required' });
      }
      
      await sql`INSERT INTO comments (comment) VALUES (${comment})`;
      return res.status(200).json({ success: true });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 