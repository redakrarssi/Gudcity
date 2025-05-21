import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// Helper function to validate the loyalty card request
const validateLoyaltyCardRequest = (body) => {
  const { customer_id, business_id, points_balance = 0 } = body;
  
  const errors = [];
  
  if (!customer_id) errors.push('Customer ID is required');
  if (!business_id) errors.push('Business ID is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create the loyalty_cards table if it doesn't exist
async function ensureLoyaltyCardsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS loyalty_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        business_id UUID NOT NULL,
        card_number VARCHAR(50),
        points_balance INTEGER DEFAULT 0,
        tier VARCHAR(50) DEFAULT 'standard',
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `;
    console.log('Loyalty cards table created or already exists');
  } catch (error) {
    console.error('Error creating loyalty_cards table:', error);
  }
}

// Ensure the table exists when the module is loaded
ensureLoyaltyCardsTable();

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

  // Handle POST request to create a new loyalty card
  if (req.method === 'POST') {
    try {
      const {
        customer_id,
        business_id,
        card_number = `CARD-${Date.now()}`,
        points_balance = 0,
        tier = 'standard',
        is_active = true
      } = req.body;

      // Validate the request
      const validation = validateLoyaltyCardRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.errors
        });
      }

      // Check if card already exists for this customer and business
      const existingCards = await sql`
        SELECT * FROM loyalty_cards 
        WHERE customer_id = ${customer_id} 
        AND business_id = ${business_id}
      `;

      if (existingCards.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'A loyalty card already exists for this customer and business',
          card: existingCards[0]
        });
      }

      // Create the loyalty card
      const result = await sql`
        INSERT INTO loyalty_cards (
          customer_id,
          business_id,
          card_number,
          points_balance,
          tier,
          is_active
        ) VALUES (
          ${customer_id},
          ${business_id},
          ${card_number},
          ${points_balance},
          ${tier},
          ${is_active}
        ) RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Loyalty card created successfully',
        card: result[0]
      });
    } catch (error) {
      console.error('Error creating loyalty card:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle GET request to fetch loyalty cards
  if (req.method === 'GET') {
    try {
      // Check if customer_id or business_id is provided
      const { customer_id, business_id } = req.query;
      
      if (!customer_id && !business_id) {
        return res.status(400).json({
          success: false,
          message: 'Either customer_id or business_id is required'
        });
      }

      let cards;
      
      // If customer_id is provided, get cards for that customer
      if (customer_id) {
        cards = await sql`
          SELECT lc.*, b.name as business_name, b.logo_url 
          FROM loyalty_cards lc
          JOIN businesses b ON lc.business_id = b.id
          WHERE lc.customer_id = ${customer_id}
          ORDER BY lc.created_at DESC
        `;
      } 
      // If business_id is provided, get all cards for that business
      else if (business_id) {
        cards = await sql`
          SELECT lc.*, c.first_name, c.last_name, c.email
          FROM loyalty_cards lc
          JOIN customers c ON lc.customer_id = c.id
          WHERE lc.business_id = ${business_id}
          ORDER BY lc.created_at DESC
        `;
      }

      return res.status(200).json({
        success: true,
        cards
      });
    } catch (error) {
      console.error('Error fetching loyalty cards:', error);
      
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