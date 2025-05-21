import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// This format works with Vercel serverless functions
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST requests are accepted.'
    });
  }

  try {
    const {
      name,
      description,
      business_id
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Program name is required'
      });
    }

    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    // Generate a UUID for the new program
    const id = uuidv4();
    const now = new Date().toISOString();

    // Insert the data into the loyalty_programs table
    const result = await sql`
      INSERT INTO loyalty_programs (
        id,
        name,
        description,
        business_id,
        created_at,
        updated_at
      ) VALUES (
        ${id},
        ${name},
        ${description || null},
        ${business_id},
        ${now},
        ${now}
      ) RETURNING *
    `;

    // Return success response with the newly created program
    return res.status(201).json({
      success: true,
      message: 'Loyalty program created successfully',
      program: result[0]
    });
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    
    // Check for specific database errors
    if (error.message.includes('foreign key constraint')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business ID. The business does not exist.',
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the loyalty program',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
} 