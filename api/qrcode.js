const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a connection to the Neon database using the environment variable
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require');

module.exports = async function handler(req, res) {
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
      const { businessId, codeType } = req.query;
      
      if (!businessId) {
        return res.status(400).json({ error: 'Business ID is required' });
      }
      
      let query = sql`
        SELECT * FROM qr_codes 
        WHERE business_id = ${businessId}
      `;
      
      if (codeType) {
        query = sql`
          SELECT * FROM qr_codes 
          WHERE business_id = ${businessId} 
          AND code_type = ${codeType}
        `;
      }
      
      const qrCodes = await query;
      return res.status(200).json(qrCodes);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
  
  // POST request - create a new QR code
  if (req.method === 'POST') {
    try {
      const { businessId, content, linkUrl, codeType, description, metadata } = req.body;
      
      // Validate required fields
      if (!businessId || !content || !codeType) {
        return res.status(400).json({ 
          error: 'Business ID, content, and code type are required' 
        });
      }
      
      // Validate code type
      const validCodeTypes = ['loyalty', 'product', 'promotion', 'payment'];
      if (!validCodeTypes.includes(codeType)) {
        return res.status(400).json({ 
          error: `Code type must be one of: ${validCodeTypes.join(', ')}` 
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
          ${businessId}, 
          ${content}, 
          ${linkUrl || null}, 
          ${codeType}, 
          ${description || null}, 
          ${metadata ? JSON.stringify(metadata) : null}
        ) RETURNING *
      `;
      
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Error creating QR code:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
  
  // PUT request - update QR code data (e.g., increment scan count)
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { scanned = false, uniqueScanner = null } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'QR code ID is required' });
      }
      
      // Get current QR code data
      const existingQRCode = await sql`SELECT * FROM qr_codes WHERE id = ${id}`;
      
      if (existingQRCode.length === 0) {
        return res.status(404).json({ error: 'QR code not found' });
      }
      
      // If this is a scan update
      if (scanned) {
        let uniqueScanIncrement = 0;
        
        // If uniqueScanner is provided and it's a new scanner, increment unique scans
        if (uniqueScanner) {
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
        
        return res.status(200).json(updatedQRCode[0]);
      } else {
        // Regular update
        const { content, linkUrl, description, metadata } = req.body;
        
        const updatedQRCode = await sql`
          UPDATE qr_codes
          SET 
            content = COALESCE(${content}, content),
            link_url = COALESCE(${linkUrl}, link_url),
            description = COALESCE(${description}, description),
            metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}, metadata),
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        
        return res.status(200).json(updatedQRCode[0]);
      }
    } catch (error) {
      console.error('Error updating QR code:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
  
  // DELETE request - delete a QR code
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'QR code ID is required' });
      }
      
      await sql`DELETE FROM qr_codes WHERE id = ${id}`;
      
      return res.status(200).json({ success: true, message: 'QR code deleted successfully' });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 