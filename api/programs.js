import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers for API route
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request to list loyalty programs
  if (req.method === 'GET') {
    try {
      const { businessId } = req.query;

      // Validate required query parameters
      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'Business ID is required as a query parameter'
        });
      }

      // Fetch programs from the database
      const programs = await sql`
        SELECT *
        FROM loyalty_programs
        WHERE business_id = ${businessId}
        ORDER BY created_at DESC
      `;

      // Return programs
      return res.status(200).json({
        success: true,
        programs
      });
    } catch (error) {
      console.error('Error fetching loyalty programs:', error);
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching loyalty programs',
        error: error.message
      });
    }
  }

  // Handle POST request to create a new loyalty program
  if (req.method === 'POST') {
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

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Loyalty program created successfully',
        programId
      });
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating the loyalty program',
        error: error.message
      });
    }
  }

  // If we reach here, the method is not supported
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`
  });
} 