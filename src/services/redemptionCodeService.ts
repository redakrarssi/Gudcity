import { nanoid } from 'nanoid';
import dbService from './database';
import type { Tables } from '../models/database.types';

/**
 * Redemption Code Service
 * Manages the generation, validation, and redemption of promo/reward codes
 */
class RedemptionCodeService {
  /**
   * Generate a new redemption code
   */
  async generateCode(
    businessId: string,
    valueType: 'points' | 'discount' | 'product',
    valueAmount: number,
    rewardId?: string,
    expiryDays: number = 30
  ): Promise<Tables['redemption_codes']> {
    try {
      // Generate a unique code (readable format)
      const code = nanoid(10).toUpperCase();
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      // Insert code into database
      const query = `
        INSERT INTO redemption_codes (
          id, business_id, code, reward_id, value_type, value_amount, 
          is_used, expires_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *
      `;
      
      const now = new Date().toISOString();
      const params = [
        nanoid(), // id
        businessId,
        code,
        rewardId || null,
        valueType,
        valueAmount,
        false, // is_used
        expiryDate.toISOString(),
        now,
        now
      ];
      
      const result = await dbService.executeQuery(query, params);
      return result[0] as Tables['redemption_codes'];
    } catch (error) {
      console.error('Error generating redemption code:', error);
      throw error;
    }
  }
  
  /**
   * Bulk generate multiple redemption codes
   */
  async bulkGenerateCodes(
    businessId: string,
    valueType: 'points' | 'discount' | 'product',
    valueAmount: number,
    count: number,
    rewardId?: string,
    expiryDays: number = 30
  ): Promise<Tables['redemption_codes'][]> {
    try {
      const codes: Tables['redemption_codes'][] = [];
      
      for (let i = 0; i < count; i++) {
        const code = await this.generateCode(
          businessId,
          valueType,
          valueAmount,
          rewardId,
          expiryDays
        );
        codes.push(code);
      }
      
      return codes;
    } catch (error) {
      console.error('Error bulk generating redemption codes:', error);
      throw error;
    }
  }
  
  /**
   * Check if a code is valid without redeeming it
   */
  async validateCode(code: string): Promise<{
    valid: boolean;
    message?: string;
    code?: Tables['redemption_codes'];
  }> {
    try {
      const query = `
        SELECT * FROM redemption_codes
        WHERE code = $1
        LIMIT 1
      `;
      
      const result = await dbService.executeQuery(query, [code]);
      
      if (result.length === 0) {
        return { valid: false, message: 'Invalid code' };
      }
      
      const redemptionCode = result[0] as Tables['redemption_codes'];
      
      // Check if code is already used
      if (redemptionCode.is_used) {
        return { valid: false, message: 'Code has already been redeemed' };
      }
      
      // Check if code is expired
      const now = new Date();
      const expiresAt = redemptionCode.expires_at ? new Date(redemptionCode.expires_at) : null;
      
      if (expiresAt && expiresAt < now) {
        return { valid: false, message: 'Code has expired' };
      }
      
      return { valid: true, code: redemptionCode };
    } catch (error) {
      console.error('Error validating redemption code:', error);
      throw error;
    }
  }
  
  /**
   * Redeem a code for a specific customer
   */
  async redeemCode(
    code: string,
    customerId: string,
    businessId?: string
  ): Promise<{
    success: boolean;
    message: string;
    redemption?: Tables['redemption_codes'];
  }> {
    try {
      // First validate the code
      const validation = await this.validateCode(code);
      
      if (!validation.valid || !validation.code) {
        return {
          success: false,
          message: validation.message || 'Invalid code'
        };
      }
      
      const redemptionCode = validation.code;
      
      // If businessId provided, verify code belongs to the business
      if (businessId && redemptionCode.business_id !== businessId) {
        return {
          success: false,
          message: 'Code is not valid for this business'
        };
      }
      
      // Update the code as used
      const updateQuery = `
        UPDATE redemption_codes
        SET is_used = true, used_by = $1, used_at = $2, updated_at = $3
        WHERE id = $4
        RETURNING *
      `;
      
      const now = new Date().toISOString();
      const updateResult = await dbService.executeQuery(
        updateQuery,
        [customerId, now, now, redemptionCode.id]
      );
      
      // Apply the reward based on the value type
      if (redemptionCode.value_type === 'points') {
        // Add points to customer
        await dbService.executeQuery(
          `UPDATE customers
           SET total_points = total_points + $1, updated_at = $2
           WHERE id = $3`,
          [redemptionCode.value_amount, now, customerId]
        );
      }
      
      // If there's a reward associated, track the redemption
      if (redemptionCode.reward_id) {
        // Create a transaction record for the redemption
        await dbService.executeQuery(
          `INSERT INTO transactions (
            id, business_id, customer_id, program_id, amount, points_earned,
            date, type, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8, $9, $10)`,
          [
            nanoid(),
            redemptionCode.business_id,
            customerId,
            0, // No monetary amount
            redemptionCode.value_amount,
            now,
            'reward_redemption',
            `Redemption code: ${code}`,
            now,
            now
          ]
        );
      }
      
      return {
        success: true,
        message: 'Code redeemed successfully',
        redemption: updateResult[0] as Tables['redemption_codes']
      };
    } catch (error) {
      console.error('Error redeeming code:', error);
      throw error;
    }
  }
  
  /**
   * Get redemption codes for a business
   */
  async getBusinessCodes(
    businessId: string,
    options: {
      limit?: number;
      offset?: number;
      isUsed?: boolean;
      isExpired?: boolean;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    codes: Tables['redemption_codes'][];
    total: number;
  }> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        isUsed, 
        isExpired, 
        sortBy = 'created_at', 
        sortDirection = 'desc' 
      } = options;
      
      // Build WHERE clause
      let whereConditions = [`business_id = '${businessId}'`];
      
      if (isUsed !== undefined) {
        whereConditions.push(`is_used = ${isUsed}`);
      }
      
      if (isExpired !== undefined) {
        const now = new Date().toISOString();
        if (isExpired) {
          whereConditions.push(`expires_at < '${now}'`);
        } else {
          whereConditions.push(`(expires_at > '${now}' OR expires_at IS NULL)`);
        }
      }
      
      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      
      // Build ORDER BY clause
      const validSortColumns = ['created_at', 'code', 'value_amount', 'expires_at', 'used_at'];
      const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const orderDirection = sortDirection === 'asc' ? 'ASC' : 'DESC';
      
      const orderClause = `ORDER BY ${orderBy} ${orderDirection}`;
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM redemption_codes
        ${whereClause}
      `;
      
      const countResult = await dbService.executeQuery(countQuery);
      const total = parseInt(countResult[0].total);
      
      // Get paginated results
      const query = `
        SELECT *
        FROM redemption_codes
        ${whereClause}
        ${orderClause}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const result = await dbService.executeQuery(query);
      
      return {
        codes: result as Tables['redemption_codes'][],
        total
      };
    } catch (error) {
      console.error('Error getting business redemption codes:', error);
      throw error;
    }
  }
  
  /**
   * Delete a redemption code
   */
  async deleteCode(codeId: string, businessId: string): Promise<boolean> {
    try {
      // Verify the code belongs to the business
      const checkQuery = `
        SELECT id FROM redemption_codes
        WHERE id = $1 AND business_id = $2
      `;
      
      const checkResult = await dbService.executeQuery(checkQuery, [codeId, businessId]);
      
      if (checkResult.length === 0) {
        throw new Error('Code not found or does not belong to the business');
      }
      
      // Delete the code
      const deleteQuery = `DELETE FROM redemption_codes WHERE id = $1`;
      await dbService.executeQuery(deleteQuery, [codeId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting redemption code:', error);
      throw error;
    }
  }
}

// Create singleton instance
const redemptionCodeService = new RedemptionCodeService();
export default redemptionCodeService; 