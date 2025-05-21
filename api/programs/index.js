import { neon } from '@neondatabase/serverless';

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers for API route
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only GET requests are accepted.'
    });
  }

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