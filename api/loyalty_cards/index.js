import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { customer_id, program_id, points, issued_at } = req.body;

    // Validate required fields
    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }
    
    if (!program_id) {
      return res.status(400).json({ success: false, message: 'Program ID is required' });
    }

    // Default points to 0 if not provided or invalid
    const cardPoints = points && !isNaN(parseInt(points)) ? parseInt(points) : 0;
    
    // Use current timestamp if issued_at not provided
    const cardIssuedAt = issued_at || new Date().toISOString();

    // Insert loyalty card into database
    const newCard = await sql`
      INSERT INTO loyalty_cards (
        customer_id, 
        program_id, 
        points,
        issued_at,
        created_at,
        updated_at
      ) 
      VALUES (
        ${customer_id}, 
        ${program_id}, 
        ${cardPoints},
        ${cardIssuedAt},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Return success response with created loyalty card
    return res.status(201).json({
      success: true,
      message: 'Loyalty card created successfully',
      card: newCard[0]
    });
  } catch (error) {
    console.error('Error creating loyalty card:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create loyalty card',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 