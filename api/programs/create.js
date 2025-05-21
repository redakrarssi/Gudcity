import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

// Create a connection to the Neon database
const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
console.log('Database URL exists:', !!DATABASE_URL);
const sql = neon(DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers for API route
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
      businessId,
      name,
      type,
      description,
      rules = {},
      active = true
    } = req.body;

    // Validate required fields
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Program name is required'
      });
    }

    if (!type || !['points', 'punchcard', 'tiered'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid program type is required (points, punchcard, or tiered)'
      });
    }

    // Generate a UUID for the new program
    const programId = uuidv4();
    const now = new Date().toISOString();

    console.log('Attempting to insert program into database', {
      programId,
      businessId,
      name,
      type
    });

    // Create the program in the database
    await sql`
      INSERT INTO loyalty_programs (
        id,
        business_id,
        name,
        type,
        description,
        rules,
        active,
        created_at,
        updated_at
      ) VALUES (
        ${programId},
        ${businessId},
        ${name},
        ${type},
        ${description || null},
        ${JSON.stringify(rules)},
        ${active},
        ${now},
        ${now}
      )
    `;

    console.log('Program successfully inserted with ID:', programId);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Loyalty program created successfully',
      programId
    });
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    
    // Check for specific database connection errors
    const errorMessage = error.message || '';
    if (errorMessage.includes('connection') || errorMessage.includes('connect')) {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please check your database configuration.',
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the loyalty program',
      error: error.message
    });
  }
} 