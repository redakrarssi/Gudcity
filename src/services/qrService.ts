import { nanoid } from 'nanoid';
import { QRCodeSVG } from 'qrcode.react';
import dbService from './database';
import type { Tables } from '../models/database.types';

/**
 * QR Code Service
 * Manages QR code generation, tracking, and analytics
 */
class QRCodeService {
  /**
   * Generate a QR code and save it to the database
   */
  async generateQRCode(
    businessId: string,
    content: string,
    options: {
      codeType: 'loyalty' | 'product' | 'promotion' | 'payment';
      linkUrl?: string;
      description?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Tables['qr_codes']> {
    try {
      const { codeType, linkUrl, description, metadata } = options;
      
      // Insert QR code to database
      const query = `
        INSERT INTO qr_codes (
          id, business_id, content, link_url, code_type, 
          scans_count, unique_scans_count, description, metadata,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;
      
      const now = new Date().toISOString();
      const params = [
        nanoid(),
        businessId,
        content,
        linkUrl || null,
        codeType,
        0, // initial scan count
        0, // initial unique scan count
        description || null,
        metadata ? JSON.stringify(metadata) : null,
        now,
        now
      ];
      
      const result = await dbService.executeQuery(query, params);
      return result[0] as Tables['qr_codes'];
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve a QR code by ID
   */
  async getQRCode(qrCodeId: string): Promise<Tables['qr_codes'] | null> {
    try {
      const query = `
        SELECT * FROM qr_codes
        WHERE id = $1
        LIMIT 1
      `;
      
      const result = await dbService.executeQuery(query, [qrCodeId]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as Tables['qr_codes'];
    } catch (error) {
      console.error('Error fetching QR code:', error);
      throw error;
    }
  }
  
  /**
   * Get all QR codes for a business
   */
  async getBusinessQRCodes(
    businessId: string,
    options: {
      limit?: number;
      offset?: number;
      codeType?: 'loyalty' | 'product' | 'promotion' | 'payment';
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    codes: Tables['qr_codes'][];
    total: number;
  }> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        codeType, 
        sortBy = 'created_at', 
        sortDirection = 'desc' 
      } = options;
      
      // Build WHERE clause
      let whereConditions = [`business_id = '${businessId}'`];
      
      if (codeType) {
        whereConditions.push(`code_type = '${codeType}'`);
      }
      
      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      
      // Build ORDER BY clause
      const validSortColumns = [
        'created_at', 'scans_count', 'unique_scans_count', 'description'
      ];
      const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const orderDirection = sortDirection === 'asc' ? 'ASC' : 'DESC';
      
      const orderClause = `ORDER BY ${orderBy} ${orderDirection}`;
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM qr_codes
        ${whereClause}
      `;
      
      const countResult = await dbService.executeQuery(countQuery);
      const total = parseInt(countResult[0].total);
      
      // Get paginated results
      const query = `
        SELECT *
        FROM qr_codes
        ${whereClause}
        ${orderClause}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const result = await dbService.executeQuery(query);
      
      return {
        codes: result as Tables['qr_codes'][],
        total
      };
    } catch (error) {
      console.error('Error getting business QR codes:', error);
      throw error;
    }
  }
  
  /**
   * Update QR code information
   */
  async updateQRCode(
    qrCodeId: string,
    businessId: string,
    updates: {
      content?: string;
      linkUrl?: string;
      description?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Tables['qr_codes']> {
    try {
      // First check if the QR code exists and belongs to the business
      const checkQuery = `
        SELECT id FROM qr_codes
        WHERE id = $1 AND business_id = $2
      `;
      
      const checkResult = await dbService.executeQuery(checkQuery, [qrCodeId, businessId]);
      
      if (checkResult.length === 0) {
        throw new Error('QR code not found or does not belong to the business');
      }
      
      // Build SET clause
      const setItems = [];
      const params = [qrCodeId]; // First param is the ID
      
      if (updates.content !== undefined) {
        setItems.push(`content = $${params.length + 1}`);
        params.push(updates.content);
      }
      
      if (updates.linkUrl !== undefined) {
        setItems.push(`link_url = $${params.length + 1}`);
        params.push(updates.linkUrl);
      }
      
      if (updates.description !== undefined) {
        setItems.push(`description = $${params.length + 1}`);
        params.push(updates.description);
      }
      
      if (updates.metadata !== undefined) {
        setItems.push(`metadata = $${params.length + 1}`);
        params.push(JSON.stringify(updates.metadata));
      }
      
      // Add updated_at
      setItems.push(`updated_at = $${params.length + 1}`);
      params.push(new Date().toISOString());
      
      // Generate update query
      const updateQuery = `
        UPDATE qr_codes
        SET ${setItems.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await dbService.executeQuery(updateQuery, params);
      return result[0] as Tables['qr_codes'];
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
  }
  
  /**
   * Delete a QR code
   */
  async deleteQRCode(qrCodeId: string, businessId: string): Promise<boolean> {
    try {
      // Verify the QR code belongs to the business
      const checkQuery = `
        SELECT id FROM qr_codes
        WHERE id = $1 AND business_id = $2
      `;
      
      const checkResult = await dbService.executeQuery(checkQuery, [qrCodeId, businessId]);
      
      if (checkResult.length === 0) {
        throw new Error('QR code not found or does not belong to the business');
      }
      
      // Delete the QR code
      const deleteQuery = `DELETE FROM qr_codes WHERE id = $1`;
      await dbService.executeQuery(deleteQuery, [qrCodeId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }
  
  /**
   * Track a QR code scan
   */
  async trackScan(
    qrCodeId: string,
    scannerIdentifier?: string
  ): Promise<boolean> {
    try {
      // Fetch the QR code
      const qrCode = await this.getQRCode(qrCodeId);
      
      if (!qrCode) {
        return false;
      }
      
      // Build the update query
      let updateQuery: string;
      let params: any[];
      
      if (scannerIdentifier) {
        // Check if this is a unique scan (first time from this identifier)
        // In a real app, you'd also track scanner identifiers in a separate table
        // For this demo, we'll just increment both counts
        updateQuery = `
          UPDATE qr_codes
          SET scans_count = scans_count + 1,
              unique_scans_count = unique_scans_count + 1,
              updated_at = $2
          WHERE id = $1
        `;
        params = [qrCodeId, new Date().toISOString()];
      } else {
        // Just increment the scan count
        updateQuery = `
          UPDATE qr_codes
          SET scans_count = scans_count + 1,
              updated_at = $2
          WHERE id = $1
        `;
        params = [qrCodeId, new Date().toISOString()];
      }
      
      await dbService.executeQuery(updateQuery, params);
      return true;
    } catch (error) {
      console.error('Error tracking QR code scan:', error);
      throw error;
    }
  }
  
  /**
   * Get QR code scan statistics
   */
  async getQRCodeStats(
    businessId: string
  ): Promise<{ 
    totalScans: number; 
    uniqueScans: number;
    byType: Record<string, { scans: number; uniqueScans: number }>;
  }> {
    try {
      // Get summary stats
      const statsQuery = `
        SELECT 
          SUM(scans_count) as total_scans,
          SUM(unique_scans_count) as total_unique_scans
        FROM qr_codes
        WHERE business_id = $1
      `;
      
      const statsResult = await dbService.executeQuery(statsQuery, [businessId]);
      
      // Get stats by type
      const typeStatsQuery = `
        SELECT 
          code_type,
          SUM(scans_count) as type_scans,
          SUM(unique_scans_count) as type_unique_scans
        FROM qr_codes
        WHERE business_id = $1
        GROUP BY code_type
      `;
      
      const typeStatsResult = await dbService.executeQuery(typeStatsQuery, [businessId]);
      
      // Format the results
      const byType: Record<string, { scans: number; uniqueScans: number }> = {};
      
      for (const row of typeStatsResult) {
        byType[row.code_type] = {
          scans: parseInt(row.type_scans) || 0,
          uniqueScans: parseInt(row.type_unique_scans) || 0
        };
      }
      
      return {
        totalScans: parseInt(statsResult[0]?.total_scans) || 0,
        uniqueScans: parseInt(statsResult[0]?.total_unique_scans) || 0,
        byType
      };
    } catch (error) {
      console.error('Error getting QR code stats:', error);
      throw error;
    }
  }
  
  /**
   * Render a QR code SVG
   */
  renderQRCode(content: string, size = 200, bgColor = "#ffffff", fgColor = "#000000") {
    return {
      value: content,
      size,
      bgColor,
      fgColor,
      level: "H" // Error correction level
    };
  }

  /**
   * Claim points by scanning a loyalty QR code
   */
  async claimPoints(
    qrCodeId: string,
    customerId: string,
    pointsAmount: number = 10
  ): Promise<{
    success: boolean;
    message: string;
    pointsAwarded?: number;
    newBalance?: number;
  }> {
    try {
      // Get the QR code to verify it exists and is a loyalty code
      const qrCode = await this.getQRCode(qrCodeId);
      
      if (!qrCode) {
        return {
          success: false,
          message: 'QR code not found'
        };
      }
      
      if (qrCode.code_type !== 'loyalty') {
        return {
          success: false,
          message: 'This QR code is not a loyalty code'
        };
      }
      
      // Track the scan
      await this.trackScan(qrCodeId, customerId);
      
      // Get the customer
      const customerQuery = `
        SELECT * FROM customers
        WHERE id = $1
        LIMIT 1
      `;
      
      const customerResult = await dbService.executeQuery(customerQuery, [customerId]);
      
      if (customerResult.length === 0) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }
      
      const customer = customerResult[0];
      
      // Update customer points
      const updateQuery = `
        UPDATE customers
        SET total_points = total_points + $1, updated_at = $2
        WHERE id = $3
        RETURNING total_points
      `;
      
      const now = new Date().toISOString();
      const updateResult = await dbService.executeQuery(
        updateQuery, 
        [pointsAmount, now, customerId]
      );
      
      const newPointsBalance = parseInt(updateResult[0].total_points);
      
      // Create a transaction record
      const businessId = qrCode.business_id;
      
      // Parse the content to get program ID if available
      let programId = null;
      if (qrCode.content.startsWith('LOYALTY:')) {
        const contentParts = qrCode.content.split(':');
        if (contentParts.length >= 3) {
          programId = contentParts[2];
        }
      }
      
      // Record the transaction
      const transactionQuery = `
        INSERT INTO transactions (
          id, business_id, customer_id, program_id, amount, points_earned,
          date, type, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await dbService.executeQuery(
        transactionQuery,
        [
          nanoid(),
          businessId,
          customerId,
          programId,
          0, // No monetary amount
          pointsAmount,
          now,
          'purchase',
          'Points claimed via QR code scan',
          now,
          now
        ]
      );
      
      // If there's a loyalty card for this program, update that too
      if (programId) {
        const loyaltyCardQuery = `
          SELECT * FROM loyalty_cards
          WHERE customer_id = $1 AND program_id = $2 AND active = true
          LIMIT 1
        `;
        
        const loyaltyCardResult = await dbService.executeQuery(
          loyaltyCardQuery, 
          [customerId, programId]
        );
        
        if (loyaltyCardResult.length > 0) {
          const cardId = loyaltyCardResult[0].id;
          
          await dbService.executeQuery(
            `UPDATE loyalty_cards 
             SET points_balance = points_balance + $1, updated_at = $2
             WHERE id = $3`,
            [pointsAmount, now, cardId]
          );
        }
      }
      
      return {
        success: true,
        message: `Successfully claimed ${pointsAmount} points!`,
        pointsAwarded: pointsAmount,
        newBalance: newPointsBalance
      };
    } catch (error) {
      console.error('Error claiming points from QR code:', error);
      throw error;
    }
  }

  /**
   * Process a scanned QR code and determine the appropriate action
   */
  async processQRCode(
    qrContent: string,
    userId?: string,
    customerId?: string
  ): Promise<{
    success: boolean;
    action: 'loyalty' | 'promotion' | 'product' | 'payment' | 'unknown';
    message: string;
    data?: any;
  }> {
    try {
      // Try to find the QR code in the database
      const query = `
        SELECT * FROM qr_codes
        WHERE content = $1
        LIMIT 1
      `;
      
      const result = await dbService.executeQuery(query, [qrContent]);
      
      // If QR code doesn't exist in our database, try to parse the content
      if (result.length === 0) {
        // Check if content follows our format conventions
        if (qrContent.startsWith('LOYALTY:')) {
          const parts = qrContent.split(':');
          if (parts.length >= 3) {
            const businessId = parts[1];
            const programId = parts[2];
            
            // Verify the business and program exist
            const programQuery = `
              SELECT * FROM loyalty_programs
              WHERE id = $1 AND business_id = $2 AND active = true
              LIMIT 1
            `;
            
            const programResult = await dbService.executeQuery(programQuery, [programId, businessId]);
            
            if (programResult.length > 0) {
              return {
                success: true,
                action: 'loyalty',
                message: 'Loyalty program QR code scanned',
                data: {
                  businessId,
                  programId,
                  programName: programResult[0].name
                }
              };
            }
          }
        } else if (qrContent.startsWith('PROMO:')) {
          const parts = qrContent.split(':');
          if (parts.length >= 3) {
            const businessId = parts[1];
            const promoCode = parts[2];
            
            return {
              success: true,
              action: 'promotion',
              message: 'Promotion QR code scanned',
              data: {
                businessId,
                promoCode
              }
            };
          }
        }
        
        // If we can't determine what type of QR code it is
        return {
          success: false,
          action: 'unknown',
          message: 'Unknown QR code format'
        };
      }
      
      // QR code found in database
      const qrCode = result[0] as Tables['qr_codes'];
      
      // Track the scan
      if (customerId) {
        await this.trackScan(qrCode.id, customerId);
      } else {
        await this.trackScan(qrCode.id);
      }
      
      // Return appropriate response based on code type
      switch (qrCode.code_type) {
        case 'loyalty':
          return {
            success: true,
            action: 'loyalty',
            message: 'Loyalty QR code scanned',
            data: {
              qrCodeId: qrCode.id,
              businessId: qrCode.business_id,
              content: qrCode.content,
              metadata: qrCode.metadata
            }
          };
          
        case 'promotion':
          return {
            success: true,
            action: 'promotion',
            message: 'Promotion QR code scanned',
            data: {
              qrCodeId: qrCode.id,
              businessId: qrCode.business_id,
              content: qrCode.content,
              linkUrl: qrCode.link_url,
              metadata: qrCode.metadata
            }
          };
          
        case 'product':
          return {
            success: true,
            action: 'product',
            message: 'Product QR code scanned',
            data: {
              qrCodeId: qrCode.id,
              businessId: qrCode.business_id,
              content: qrCode.content,
              linkUrl: qrCode.link_url,
              metadata: qrCode.metadata
            }
          };
          
        case 'payment':
          return {
            success: true,
            action: 'payment',
            message: 'Payment QR code scanned',
            data: {
              qrCodeId: qrCode.id,
              businessId: qrCode.business_id,
              content: qrCode.content,
              metadata: qrCode.metadata
            }
          };
          
        default:
          return {
            success: true,
            action: 'unknown',
            message: 'QR code scanned',
            data: {
              qrCodeId: qrCode.id,
              businessId: qrCode.business_id,
              content: qrCode.content
            }
          };
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      return {
        success: false,
        action: 'unknown',
        message: 'Error processing QR code'
      };
    }
  }
}

// Create singleton instance
const qrCodeService = new QRCodeService();
export default qrCodeService;
export { qrCodeService, QRCodeService };
// Export the claimPoints function for direct import
export const claimPoints = qrCodeService.claimPoints.bind(qrCodeService);
// Export the processQRCode function for direct import
export const processQRCode = qrCodeService.processQRCode.bind(qrCodeService);