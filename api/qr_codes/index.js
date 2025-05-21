import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { business_id, target_type, target_id, qr_data } = req.body;

    // Validate required fields
    if (!business_id) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    if (!target_type) {
      return res.status(400).json({ success: false, message: 'Target type is required' });
    }
    
    if (!qr_data) {
      return res.status(400).json({ success: false, message: 'QR data is required' });
    }

    // Insert QR code into database
    const newQRCode = await sql`
      INSERT INTO qr_codes (
        business_id,
        target_type,
        target_id,
        qr_data,
        created_at,
        updated_at
      ) 
      VALUES (
        ${business_id},
        ${target_type},
        ${target_id || null},
        ${qr_data},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Return success response with created QR code
    return res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      qr_code: newQRCode[0]
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 