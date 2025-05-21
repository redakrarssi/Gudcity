import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

// Generate a random redemption code
function generateRedemptionCode(length = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let { reward_id, customer_id, code, redeemed = false, created_at } = req.body;

    // Validate required fields
    if (!reward_id) {
      return res.status(400).json({ success: false, message: 'Reward ID is required' });
    }
    
    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }

    // Generate a code if not provided
    if (!code) {
      code = generateRedemptionCode();
    }
    
    // Default created_at to current timestamp if not provided
    if (!created_at) {
      created_at = new Date().toISOString();
    }

    // Convert redeemed to boolean to ensure correct type
    redeemed = Boolean(redeemed);

    // Insert redemption code into database
    const newCode = await sql`
      INSERT INTO redemption_codes (
        reward_id,
        customer_id,
        code,
        redeemed,
        created_at
      ) 
      VALUES (
        ${reward_id},
        ${customer_id},
        ${code},
        ${redeemed},
        ${created_at}
      )
      RETURNING *
    `;

    // Return success response with created redemption code
    return res.status(201).json({
      success: true,
      message: 'Redemption code created successfully',
      redemption_code: newCode[0]
    });
  } catch (error) {
    console.error('Error creating redemption code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create redemption code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 