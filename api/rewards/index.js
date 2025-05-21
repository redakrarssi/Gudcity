import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { business_id, title, description, points_required } = req.body;

    // Validate required fields
    if (!business_id) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!points_required || isNaN(parseInt(points_required))) {
      return res.status(400).json({ success: false, message: 'Valid points required value is required' });
    }

    // Insert reward into database
    const newReward = await sql`
      INSERT INTO rewards (
        business_id, 
        title, 
        description, 
        points_required,
        created_at
      ) 
      VALUES (
        ${business_id}, 
        ${title}, 
        ${description || ''}, 
        ${parseInt(points_required)},
        NOW()
      )
      RETURNING *
    `;

    // Return success response with created reward
    return res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      reward: newReward[0]
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 