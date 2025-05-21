import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// Generate a random code
const generateRandomCode = (length = 8) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .toUpperCase()
    .slice(0, length);
};

// Helper function to validate the redemption code request
const validateRedemptionCodeRequest = (body) => {
  const { reward_id, business_id } = body;
  
  const errors = [];
  
  if (!reward_id) errors.push('Reward ID is required');
  if (!business_id) errors.push('Business ID is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create the redemption_codes table if it doesn't exist
async function ensureRedemptionCodesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS redemption_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(20) UNIQUE NOT NULL,
        reward_id UUID NOT NULL,
        business_id UUID NOT NULL,
        customer_id UUID,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        redeemed_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (business_id) REFERENCES businesses(id),
        FOREIGN KEY (reward_id) REFERENCES rewards(id)
      )
    `;
    console.log('Redemption codes table created or already exists');
  } catch (error) {
    console.error('Error creating redemption_codes table:', error);
  }
}

// Ensure the table exists when the module is loaded
ensureRedemptionCodesTable();

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

  // Handle POST request to create a new redemption code
  if (req.method === 'POST') {
    try {
      const {
        reward_id,
        business_id,
        customer_id = null,
        code = generateRandomCode(),
        status = 'active',
        expires_at = null
      } = req.body;

      // Validate the request
      const validation = validateRedemptionCodeRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.errors
        });
      }

      // Create the redemption code
      const result = await sql`
        INSERT INTO redemption_codes (
          code,
          reward_id,
          business_id,
          customer_id,
          status,
          expires_at
        ) VALUES (
          ${code},
          ${reward_id},
          ${business_id},
          ${customer_id},
          ${status},
          ${expires_at}
        ) RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Redemption code created successfully',
        redemption_code: result[0]
      });
    } catch (error) {
      console.error('Error creating redemption code:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle GET request to fetch redemption codes
  if (req.method === 'GET') {
    try {
      const { business_id, customer_id, reward_id, status, code } = req.query;
      
      // Build the query based on the provided parameters
      let queryConditions = [];
      let queryParams = [];
      
      if (business_id) {
        queryConditions.push(`business_id = ${business_id}`);
      }
      
      if (customer_id) {
        queryConditions.push(`customer_id = ${customer_id}`);
      }
      
      if (reward_id) {
        queryConditions.push(`reward_id = ${reward_id}`);
      }
      
      if (status) {
        queryConditions.push(`status = ${status}`);
      }
      
      if (code) {
        queryConditions.push(`code = ${code}`);
      }
      
      // If no query parameters are provided, return an error
      if (queryConditions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one filter parameter is required (business_id, customer_id, reward_id, status, or code)'
        });
      }
      
      // Construct the SQL query
      const whereClause = queryConditions.join(' AND ');
      const codes = await sql`
        SELECT rc.*, r.name as reward_name, r.points_required, r.description as reward_description
        FROM redemption_codes rc
        JOIN rewards r ON rc.reward_id = r.id
        WHERE ${sql.raw(whereClause)}
        ORDER BY rc.created_at DESC
      `;

      return res.status(200).json({
        success: true,
        redemption_codes: codes
      });
    } catch (error) {
      console.error('Error fetching redemption codes:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle PUT request to update redemption code status
  if (req.method === 'PUT') {
    try {
      const { code, status, customer_id } = req.body;
      
      if (!code || !status) {
        return res.status(400).json({
          success: false,
          message: 'Code and status are required'
        });
      }
      
      // Valid status values
      const validStatuses = ['active', 'redeemed', 'expired', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      // Get the current code record
      const existingCodes = await sql`
        SELECT * FROM redemption_codes WHERE code = ${code}
      `;
      
      if (existingCodes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Redemption code not found'
        });
      }
      
      // If status is being changed to 'redeemed', set redeemed_at timestamp
      let redeemedAt = null;
      if (status === 'redeemed') {
        redeemedAt = new Date();
      }
      
      // Update the code status
      const result = await sql`
        UPDATE redemption_codes
        SET 
          status = ${status},
          redeemed_at = ${redeemedAt},
          customer_id = ${customer_id || existingCodes[0].customer_id}
        WHERE code = ${code}
        RETURNING *
      `;

      return res.status(200).json({
        success: true,
        message: 'Redemption code updated successfully',
        redemption_code: result[0]
      });
    } catch (error) {
      console.error('Error updating redemption code:', error);
      
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