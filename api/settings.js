import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// Helper function to validate the settings request
const validateSettingsRequest = (body) => {
  const { business_id, settings_key } = body;
  
  const errors = [];
  
  if (!business_id) errors.push('Business ID is required');
  if (!settings_key) errors.push('Settings key is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create the settings table if it doesn't exist
async function ensureSettingsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL,
        settings_key VARCHAR(100) NOT NULL,
        settings_value JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id),
        UNIQUE(business_id, settings_key)
      )
    `;
    console.log('Settings table created or already exists');
  } catch (error) {
    console.error('Error creating settings table:', error);
  }
}

// Ensure the table exists when the module is loaded
ensureSettingsTable();

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

  // Handle POST request to create or update a setting
  if (req.method === 'POST') {
    try {
      const {
        business_id,
        settings_key,
        settings_value
      } = req.body;

      // Validate the request
      const validation = validateSettingsRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.errors
        });
      }

      // Check if the setting already exists
      const existingSettings = await sql`
        SELECT * FROM settings 
        WHERE business_id = ${business_id} 
        AND settings_key = ${settings_key}
      `;

      let result;
      
      // If setting exists, update it
      if (existingSettings.length > 0) {
        result = await sql`
          UPDATE settings 
          SET 
            settings_value = ${JSON.stringify(settings_value)},
            updated_at = NOW()
          WHERE 
            business_id = ${business_id} 
            AND settings_key = ${settings_key}
          RETURNING *
        `;
        
        return res.status(200).json({
          success: true,
          message: 'Setting updated successfully',
          setting: result[0]
        });
      } 
      // If setting doesn't exist, create it
      else {
        result = await sql`
          INSERT INTO settings (
            business_id,
            settings_key,
            settings_value
          ) VALUES (
            ${business_id},
            ${settings_key},
            ${JSON.stringify(settings_value)}
          ) RETURNING *
        `;
        
        return res.status(201).json({
          success: true,
          message: 'Setting created successfully',
          setting: result[0]
        });
      }
    } catch (error) {
      console.error('Error creating/updating setting:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle GET request to fetch settings
  if (req.method === 'GET') {
    try {
      const { business_id, settings_key } = req.query;
      
      if (!business_id) {
        return res.status(400).json({
          success: false,
          message: 'Business ID is required'
        });
      }

      let settings;
      
      // If settings_key is provided, get that specific setting
      if (settings_key) {
        settings = await sql`
          SELECT * FROM settings 
          WHERE business_id = ${business_id}
          AND settings_key = ${settings_key}
        `;
        
        // If setting not found, return null (not an error)
        if (settings.length === 0) {
          return res.status(200).json({
            success: true,
            setting: null
          });
        }
        
        return res.status(200).json({
          success: true,
          setting: settings[0]
        });
      } 
      // Otherwise, get all settings for the business
      else {
        settings = await sql`
          SELECT * FROM settings 
          WHERE business_id = ${business_id}
          ORDER BY settings_key
        `;
        
        return res.status(200).json({
          success: true,
          settings
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error.message
      });
    }
  }

  // Handle DELETE request to remove a setting
  if (req.method === 'DELETE') {
    try {
      const { business_id, settings_key } = req.query;
      
      if (!business_id || !settings_key) {
        return res.status(400).json({
          success: false,
          message: 'Business ID and settings key are required'
        });
      }
      
      // Check if the setting exists
      const existingSettings = await sql`
        SELECT * FROM settings 
        WHERE business_id = ${business_id} 
        AND settings_key = ${settings_key}
      `;
      
      if (existingSettings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Setting not found'
        });
      }
      
      // Delete the setting
      await sql`
        DELETE FROM settings 
        WHERE business_id = ${business_id} 
        AND settings_key = ${settings_key}
      `;
      
      return res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting setting:', error);
      
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