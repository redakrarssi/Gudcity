import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL);

// Create the qr_codes table if it doesn't exist
async function ensureQRCodesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL,
        content TEXT NOT NULL,
        link_url TEXT,
        code_type VARCHAR(20) NOT NULL CHECK (code_type IN ('loyalty', 'product', 'promotion', 'payment')),
        scans_count INTEGER DEFAULT 0,
        unique_scans_count INTEGER DEFAULT 0,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id)
      )
    `;
    console.log('QR codes table created or already exists');
  } catch (error) {
    console.error('Error creating qr_codes table:', error);
  }
}

// Ensure the table exists when the module is loaded
ensureQRCodesTable();

// Helper function to validate QR code request
const validateQRCodeRequest = (body) => {
  const { business_id, content, code_type } = body;
  
  const errors = [];
  
  if (!business_id) errors.push('Business ID is required');
  if (!content) errors.push('Content is required');
  if (!code_type) errors.push('Code type is required');
  
  // Validate code type
  const validCodeTypes = ['loyalty', 'product', 'promotion', 'payment'];
  if (code_type && !validCodeTypes.includes(code_type)) {
    errors.push(`Code type must be one of: ${validCodeTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

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

  // GET request - get QR codes for a business
  if (req.method === 'GET') {
    try {
      const { business_id, code_type } = req.query;
      
      if (!business_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Business ID is required' 
        });
      }
      
      let qrCodes;
      
      if (code_type) {
        qrCodes = await sql`
          SELECT * FROM qr_codes 
          WHERE business_id = ${business_id} 
          AND code_type = ${code_type}
          ORDER BY created_at DESC
        `;
      } else {
        qrCodes = await sql`
          SELECT * FROM qr_codes 
          WHERE business_id = ${business_id}
          ORDER BY created_at DESC
        `;
      }
      
      return res.status(200).json({
        success: true,
        qr_codes: qrCodes
      });
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        details: error.message 
      });
    }
  }
  
  // POST request - create a new QR code
  if (req.method === 'POST') {
    try {
      const { 
        business_id, 
        content, 
        link_url, 
        code_type, 
        description, 
        metadata 
      } = req.body;
      
      // Validate the request
      const validation = validateQRCodeRequest(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation error',
          errors: validation.errors
        });
      }
      
      // Create the QR code record
      const result = await sql`
        INSERT INTO qr_codes (
          business_id, 
          content, 
          link_url, 
          code_type, 
          description, 
          metadata
        ) VALUES (
          ${business_id}, 
          ${content}, 
          ${link_url || null}, 
          ${code_type}, 
          ${description || null}, 
          ${metadata ? JSON.stringify(metadata) : null}
        ) RETURNING *
      `;
      
      return res.status(201).json({
        success: true,
        message: 'QR code created successfully',
        qr_code: result[0]
      });
    } catch (error) {
      console.error('Error creating QR code:', error);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        details: error.message 
      });
    }
  }
  
  // PUT request - update QR code data (e.g., increment scan count)
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { scanned = false, unique_scanner = null } = req.body;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'QR code ID is required' 
        });
      }
      
      // Get current QR code data
      const existingQRCodes = await sql`SELECT * FROM qr_codes WHERE id = ${id}`;
      
      if (existingQRCodes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'QR code not found' 
        });
      }
      
      // If this is a scan update
      if (scanned) {
        let uniqueScanIncrement = 0;
        
        // If unique_scanner is provided and it's a new scanner, increment unique scans
        if (unique_scanner) {
          // In a real app, you'd track unique scanners in a separate table
          // For this example, we're just incrementing the count
          uniqueScanIncrement = 1;
        }
        
        // Update scan counts
        const updatedQRCode = await sql`
          UPDATE qr_codes
          SET 
            scans_count = scans_count + 1,
            unique_scans_count = unique_scans_count + ${uniqueScanIncrement},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        
        return res.status(200).json({
          success: true,
          message: 'QR code scan count updated',
          qr_code: updatedQRCode[0]
        });
      } else {
        // Regular update
        const { content, link_url, description, metadata } = req.body;
        
        const updatedQRCode = await sql`
          UPDATE qr_codes
          SET 
            content = COALESCE(${content}, content),
            link_url = COALESCE(${link_url}, link_url),
            description = COALESCE(${description}, description),
            metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}, metadata),
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        
        return res.status(200).json({
          success: true,
          message: 'QR code updated successfully',
          qr_code: updatedQRCode[0]
        });
      }
    } catch (error) {
      console.error('Error updating QR code:', error);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        details: error.message 
      });
    }
  }
  
  // DELETE request - delete a QR code
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'QR code ID is required' 
        });
      }
      
      // Check if the QR code exists
      const existingQRCodes = await sql`SELECT * FROM qr_codes WHERE id = ${id}`;
      
      if (existingQRCodes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'QR code not found' 
        });
      }
      
      await sql`DELETE FROM qr_codes WHERE id = ${id}`;
      
      return res.status(200).json({ 
        success: true, 
        message: 'QR code deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        details: error.message 
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ 
    success: false, 
    message: 'Method not allowed' 
  });
} 