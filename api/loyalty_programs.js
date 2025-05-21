import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// Helper function to validate the loyalty program request
const validateLoyaltyProgramRequest = (body) => {
  const { name, business_id, points_per_purchase, points_per_referral, is_active } = body;
  
  const errors = [];
  
  if (!name) errors.push('Program name is required');
  if (!business_id) errors.push('Business ID is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create the loyalty_programs table if it doesn't exist
async function ensureLoyaltyProgramsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_programs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        business_id UUID NOT NULL,
        description TEXT,
        points_per_purchase FLOAT DEFAULT 1,
        points_per_referral INTEGER DEFAULT 0,
        points_expiry_days INTEGER,
        rules JSONB,
        tiers JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `;
    console.log('Loyalty programs table created or already exists');
  } catch (error) {
    console.error('Error creating loyalty_programs table:', error);
  }
}

// Ensure the table exists when the module is loaded
ensureLoyaltyProgramsTable();

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

  // Handle POST request to create a new loyalty program
  if (req.method === 'POST') {
    try {
      const {
        name,
        business_id,
        description = null,
        points_per_purchase = 1,
        points_per_referral = 0,
        points_expiry_days = null,
        rules = null,
        tiers = null,
        is_active = true
      } = req.body;

      // Validate the request
      const validation = validateLoyaltyProgramRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.errors
        });
      }

      // Check if a loyalty program already exists for this business
      const existingPrograms = await sql`
        SELECT * FROM loyalty_programs 
        WHERE business_id = ${business_id}
      `;

      if (existingPrograms.length > 0) {
        // If a program exists, we could either return an error or update the existing one
        // Here, we'll return an error and suggest using PUT to update
        return res.status(409).json({
          success: false,
          message: 'A loyalty program already exists for this business. Use PUT to update.',
          program: existingPrograms[0]
        });
      }

      // Create the loyalty program
      const result = await sql`
        INSERT INTO loyalty_programs (
          name,
          business_id,
          description,
          points_per_purchase,
          points_per_referral,
          points_expiry_days,
          rules,
          tiers,
          is_active
        ) VALUES (
          ${name},
          ${business_id},
          ${description},
          ${points_per_purchase},
          ${points_per_referral},
          ${points_expiry_days},
          ${rules ? JSON.stringify(rules) : null},
          ${tiers ? JSON.stringify(tiers) : null},
          ${is_active}
        ) RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Loyalty program created successfully',
        program: result[0]
      });
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle GET request to fetch loyalty programs
  if (req.method === 'GET') {
    try {
      const { business_id } = req.query;
      
      if (!business_id) {
        return res.status(400).json({
          success: false,
          message: 'Business ID is required'
        });
      }

      const programs = await sql`
        SELECT * FROM loyalty_programs 
        WHERE business_id = ${business_id}
      `;

      // If no programs found, return empty array (not an error)
      return res.status(200).json({
        success: true,
        programs
      });
    } catch (error) {
      console.error('Error fetching loyalty programs:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle PUT request to update a loyalty program
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Program ID is required'
        });
      }
      
      const {
        name,
        description,
        points_per_purchase,
        points_per_referral,
        points_expiry_days,
        rules,
        tiers,
        is_active
      } = req.body;
      
      // Check if the program exists
      const existingPrograms = await sql`
        SELECT * FROM loyalty_programs WHERE id = ${id}
      `;
      
      if (existingPrograms.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loyalty program not found'
        });
      }
      
      // Update the program
      const result = await sql`
        UPDATE loyalty_programs
        SET 
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          points_per_purchase = COALESCE(${points_per_purchase}, points_per_purchase),
          points_per_referral = COALESCE(${points_per_referral}, points_per_referral),
          points_expiry_days = COALESCE(${points_expiry_days}, points_expiry_days),
          rules = COALESCE(${rules ? JSON.stringify(rules) : null}, rules),
          tiers = COALESCE(${tiers ? JSON.stringify(tiers) : null}, tiers),
          is_active = COALESCE(${is_active}, is_active),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      return res.status(200).json({
        success: true,
        message: 'Loyalty program updated successfully',
        program: result[0]
      });
    } catch (error) {
      console.error('Error updating loyalty program:', error);
      
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