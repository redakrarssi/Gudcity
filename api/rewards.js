import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// Helper function to validate the reward request
const validateRewardRequest = (body) => {
  const { name, description, points_required, business_id, is_active } = body;
  
  const errors = [];
  
  if (!name) errors.push('Reward name is required');
  if (!points_required) errors.push('Points required is required');
  if (!business_id) errors.push('Business ID is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create the rewards table if it doesn't exist
async function ensureRewardsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        points_required INTEGER NOT NULL,
        business_id UUID NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        redemption_limit INTEGER,
        valid_from TIMESTAMP WITH TIME ZONE,
        valid_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `;
    console.log('Rewards table created or already exists');
  } catch (error) {
    console.error('Error creating rewards table:', error);
  }
}

// Ensure the table exists when the module is loaded
ensureRewardsTable();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST request to create a new reward
  if (req.method === 'POST') {
    try {
      const { 
        name, 
        description, 
        points_required, 
        business_id, 
        image_url, 
        is_active = true,
        redemption_limit = null,
        valid_from = null,
        valid_until = null
      } = req.body;

      // Validate the request
      const validation = validateRewardRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.errors
        });
      }

      // Create the reward
      const result = await sql`
        INSERT INTO rewards (
          name,
          description,
          points_required,
          business_id,
          image_url,
          is_active,
          redemption_limit,
          valid_from,
          valid_until
        ) VALUES (
          ${name},
          ${description || null},
          ${points_required},
          ${business_id},
          ${image_url || null},
          ${is_active},
          ${redemption_limit},
          ${valid_from},
          ${valid_until}
        ) RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Reward created successfully',
        reward: result[0]
      });
    } catch (error) {
      console.error('Error creating reward:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle GET request to fetch rewards
  if (req.method === 'GET') {
    try {
      const businessId = req.query.business_id;
      
      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'Business ID is required'
        });
      }

      const rewards = await sql`
        SELECT * FROM rewards 
        WHERE business_id = ${businessId}
        ORDER BY created_at DESC
      `;

      return res.status(200).json({
        success: true,
        rewards
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle invalid method
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
} 