import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { business_id, key, value } = req.body;

    // Validate required fields
    if (!business_id) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'Setting key is required' });
    }
    
    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, message: 'Setting value is required' });
    }

    // Determine value type and convert to JSON if necessary
    let storedValue = value;
    if (typeof value === 'object') {
      storedValue = JSON.stringify(value);
    }

    // Insert or update setting in database (upsert)
    const result = await sql`
      INSERT INTO settings (
        business_id,
        key,
        value,
        created_at,
        updated_at
      ) 
      VALUES (
        ${business_id},
        ${key},
        ${storedValue},
        NOW(),
        NOW()
      )
      ON CONFLICT (business_id, key) 
      DO UPDATE SET 
        value = ${storedValue},
        updated_at = NOW()
      RETURNING *
    `;

    // Return success response with created/updated setting
    return res.status(201).json({
      success: true,
      message: 'Setting created/updated successfully',
      setting: result[0]
    });
  } catch (error) {
    console.error('Error creating/updating setting:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create/update setting',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 