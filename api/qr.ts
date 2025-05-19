import type { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { sql } from '../src/services/neonService';

/**
 * Generate a new QR code
 * POST /api/qr/generate
 */
export async function generateQrCode(req: Request, res: Response) {
  try {
    const {
      businessId,
      codeType,
      content,
      linkUrl = null,
      description = null,
      metadata = {}
    } = req.body;
    
    // Validate required fields
    if (!businessId || !codeType || !content) {
      return res.status(400).json({
        success: false,
        message: 'Business ID, code type, and content are required'
      });
    }
    
    // Validate code type
    const validTypes = ['loyalty', 'product', 'promotion', 'payment'];
    if (!validTypes.includes(codeType)) {
      return res.status(400).json({
        success: false,
        message: `Code type must be one of: ${validTypes.join(', ')}`
      });
    }
    
    const id = nanoid();
    const now = new Date().toISOString();
    
    // Create QR code record
    await sql`
      INSERT INTO qr_codes (
        id, business_id, content, link_url, code_type, 
        scans_count, unique_scans_count, description, 
        metadata, created_at, updated_at
      ) VALUES (
        ${id}, ${businessId}, ${content}, ${linkUrl}, ${codeType}, 
        0, 0, ${description}, ${JSON.stringify(metadata)}, ${now}, ${now}
      )
    `;
    
    return res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      qrId: id,
      content
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get QR codes for a business
 * GET /api/qr?businessId=123
 */
export async function getQrCodes(req: Request, res: Response) {
  try {
    const { businessId, type } = req.query;
    
    // Validate required parameters
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    let query = `
      SELECT * FROM qr_codes
      WHERE business_id = $1
    `;
    
    const params = [businessId];
    
    // Add filter by type if provided
    if (type) {
      query += ` AND code_type = $2`;
      params.push(type);
    }
    
    // Order by created date descending
    query += ` ORDER BY created_at DESC`;
    
    const qrCodes = await sql.query(query, params);
    
    return res.status(200).json({
      success: true,
      qrCodes
    });
  } catch (error) {
    console.error('Error getting QR codes:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get a QR code by ID
 * GET /api/qr/:id
 */
export async function getQrCodeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const qrCodes = await sql`
      SELECT * FROM qr_codes WHERE id = ${id}
    `;
    
    if (qrCodes.length === 0) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    return res.status(200).json({
      success: true,
      qrCode: qrCodes[0]
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Process QR code scan
 * POST /api/qr/scan
 */
export async function scanQrCode(req: Request, res: Response) {
  try {
    const { qrId, customerId = null } = req.body;
    
    // Validate required fields
    if (!qrId) {
      return res.status(400).json({
        success: false,
        message: 'QR code ID is required'
      });
    }
    
    // Get QR code details
    const qrCodes = await sql`
      SELECT * FROM qr_codes WHERE id = ${qrId}
    `;
    
    if (qrCodes.length === 0) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    const qrCode = qrCodes[0];
    
    // Track scan
    await sql`
      UPDATE qr_codes
      SET scans_count = scans_count + 1,
          updated_at = ${new Date().toISOString()}
      WHERE id = ${qrId}
    `;
    
    // Special handling based on code type
    let responseData = {};
    
    switch (qrCode.code_type) {
      case 'loyalty':
        if (customerId) {
          // Check if this customer already scanned this code
          const uniqueScan = await trackCustomerScan(qrId, customerId);
          
          // If it's a loyalty action, process loyalty points
          if (qrCode.metadata && qrCode.metadata.action === 'earn_points' && qrCode.metadata.points) {
            // Add points to customer
            await sql`
              UPDATE customers
              SET total_points = total_points + ${qrCode.metadata.points},
                  updated_at = ${new Date().toISOString()}
              WHERE id = ${customerId}
            `;
            
            // Add transaction record
            await sql`
              INSERT INTO transactions (
                id, business_id, customer_id, amount, points_earned,
                date, type, notes, created_at, updated_at
              ) VALUES (
                ${nanoid()}, ${qrCode.business_id}, ${customerId}, 0, ${qrCode.metadata.points},
                ${new Date().toISOString()}, 'purchase', 'QR code scan reward', 
                ${new Date().toISOString()}, ${new Date().toISOString()}
              )
            `;
            
            responseData = {
              points: qrCode.metadata.points,
              uniqueScan
            };
          }
        }
        break;
        
      case 'product':
        // Return product information
        responseData = {
          productInfo: qrCode.metadata
        };
        break;
        
      case 'promotion':
        // Return promotion information
        responseData = {
          promotionInfo: qrCode.metadata
        };
        break;
    }
    
    return res.status(200).json({
      success: true,
      message: 'QR code scanned successfully',
      qrCode,
      ...responseData
    });
  } catch (error) {
    console.error('Error processing QR code scan:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Track unique customer scan
 */
async function trackCustomerScan(qrId: string, customerId: string): Promise<boolean> {
  try {
    // Check if this customer has scanned this code before
    // In a real implementation, we would have a separate table for tracking scans
    // For simplicity, we'll use the metadata field
    const qrCodes = await sql`
      SELECT metadata FROM qr_codes WHERE id = ${qrId}
    `;
    
    if (qrCodes.length === 0) {
      return false;
    }
    
    const qrCode = qrCodes[0];
    const metadata = qrCode.metadata || {};
    
    // Check if customer has scanned before
    const scannedCustomers = metadata.scanned_customers || [];
    const alreadyScanned = scannedCustomers.includes(customerId);
    
    if (!alreadyScanned) {
      // Add customer to scanned list
      scannedCustomers.push(customerId);
      metadata.scanned_customers = scannedCustomers;
      
      // Update QR code with new metadata and increment unique scans count
      await sql`
        UPDATE qr_codes
        SET unique_scans_count = unique_scans_count + 1,
            metadata = ${JSON.stringify(metadata)},
            updated_at = ${new Date().toISOString()}
        WHERE id = ${qrId}
      `;
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error tracking customer scan:', error);
    throw error;
  }
}

/**
 * Delete a QR code
 * DELETE /api/qr/:id
 */
export async function deleteQrCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if QR code exists
    const qrCodes = await sql`
      SELECT * FROM qr_codes WHERE id = ${id}
    `;
    
    if (qrCodes.length === 0) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }
    
    // Delete the QR code
    await sql`
      DELETE FROM qr_codes WHERE id = ${id}
    `;
    
    return res.status(200).json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default {
  generateQrCode,
  getQrCodes,
  getQrCodeById,
  scanQrCode,
  deleteQrCode
}; 