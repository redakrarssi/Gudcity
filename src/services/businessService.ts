import dbService from './database';
import type { Tables } from '../models/database.types';
import { nanoid } from 'nanoid';

/**
 * Business Service
 * Handles business-related operations against the database
 */
class BusinessService {
  /**
   * Get a business by ID
   */
  async getBusinessById(businessId: string): Promise<Tables['businesses'] | null> {
    try {
      const query = `
        SELECT * FROM businesses
        WHERE id = $1
        LIMIT 1
      `;
      
      const result = await dbService.executeQuery(query, [businessId]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as Tables['businesses'];
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  }
  
  /**
   * Get a business by owner ID
   */
  async getBusinessByOwnerId(ownerId: string): Promise<Tables['businesses'] | null> {
    try {
      const query = `
        SELECT * FROM businesses
        WHERE owner_id = $1
        LIMIT 1
      `;
      
      const result = await dbService.executeQuery(query, [ownerId]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as Tables['businesses'];
    } catch (error) {
      console.error('Error fetching business by owner:', error);
      throw error;
    }
  }
  
  /**
   * Update business profile
   */
  async updateBusinessProfile(
    businessId: string,
    updates: Partial<Tables['businesses']>
  ): Promise<Tables['businesses']> {
    try {
      // Build SET clause
      const setItems = [];
      const params = [businessId]; // First param is the ID
      
      const allowedFields = [
        'name', 'address', 'phone', 'email', 
        'website', 'description', 'logo_url'
      ];
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          setItems.push(`${key} = $${params.length + 1}`);
          params.push(value);
        }
      }
      
      // Add updated_at
      setItems.push(`updated_at = $${params.length + 1}`);
      params.push(new Date().toISOString());
      
      // Generate update query
      const updateQuery = `
        UPDATE businesses
        SET ${setItems.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await dbService.executeQuery(updateQuery, params);
      return result[0] as Tables['businesses'];
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }
  
  /**
   * Get business dashboard statistics
   */
  async getBusinessStats(businessId: string): Promise<{
    customerCount: number;
    newCustomers7Days: number;
    totalTransactions: number;
    recentTransactions: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
  }> {
    try {
      // Get customer count
      const customerCountQuery = `
        SELECT COUNT(*) as total 
        FROM customers 
        WHERE business_id = $1
      `;
      
      // Get new customers in the last 7 days
      const newCustomersQuery = `
        SELECT COUNT(*) as total 
        FROM customers 
        WHERE business_id = $1 
        AND sign_up_date >= NOW() - INTERVAL '7 days'
      `;
      
      // Get transaction counts
      const transactionCountQuery = `
        SELECT COUNT(*) as total 
        FROM transactions 
        WHERE business_id = $1
      `;
      
      // Get recent transactions (last 30 days)
      const recentTransactionsQuery = `
        SELECT COUNT(*) as total 
        FROM transactions 
        WHERE business_id = $1 
        AND date >= NOW() - INTERVAL '30 days'
      `;
      
      // Get total points issued and redeemed
      const pointsQuery = `
        SELECT 
          SUM(CASE WHEN type = 'purchase' THEN points_earned ELSE 0 END) as points_issued,
          SUM(CASE WHEN type = 'reward_redemption' THEN points_earned ELSE 0 END) as points_redeemed
        FROM transactions 
        WHERE business_id = $1
      `;
      
      // Execute all queries
      const [
        customerCountResult,
        newCustomersResult,
        transactionCountResult,
        recentTransactionsResult,
        pointsResult
      ] = await Promise.all([
        dbService.executeQuery(customerCountQuery, [businessId]),
        dbService.executeQuery(newCustomersQuery, [businessId]),
        dbService.executeQuery(transactionCountQuery, [businessId]),
        dbService.executeQuery(recentTransactionsQuery, [businessId]),
        dbService.executeQuery(pointsQuery, [businessId])
      ]);
      
      return {
        customerCount: parseInt(customerCountResult[0]?.total || '0'),
        newCustomers7Days: parseInt(newCustomersResult[0]?.total || '0'),
        totalTransactions: parseInt(transactionCountResult[0]?.total || '0'),
        recentTransactions: parseInt(recentTransactionsResult[0]?.total || '0'),
        totalPointsIssued: parseInt(pointsResult[0]?.points_issued || '0'),
        totalPointsRedeemed: parseInt(pointsResult[0]?.points_redeemed || '0')
      };
    } catch (error) {
      console.error('Error getting business stats:', error);
      throw error;
    }
  }
  
  /**
   * Get business settings
   */
  async getBusinessSettings(
    businessId: string,
    category: string
  ): Promise<Record<string, any>> {
    try {
      const query = `
        SELECT settings_data
        FROM settings
        WHERE business_id = $1 AND category = $2
        LIMIT 1
      `;
      
      const result = await dbService.executeQuery(query, [businessId, category]);
      
      if (result.length === 0) {
        return {}; // No settings found
      }
      
      return result[0].settings_data;
    } catch (error) {
      console.error('Error getting business settings:', error);
      throw error;
    }
  }
  
  /**
   * Update business settings
   */
  async updateBusinessSettings(
    businessId: string,
    category: string,
    settingsData: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      // Check if settings already exist
      const checkQuery = `
        SELECT id FROM settings
        WHERE business_id = $1 AND category = $2
        LIMIT 1
      `;
      
      const checkResult = await dbService.executeQuery(checkQuery, [businessId, category]);
      
      if (checkResult.length > 0) {
        // Update existing settings
        const updateQuery = `
          UPDATE settings
          SET settings_data = $1, updated_at = $2
          WHERE business_id = $3 AND category = $4
          RETURNING settings_data
        `;
        
        const result = await dbService.executeQuery(
          updateQuery, 
          [settingsData, new Date().toISOString(), businessId, category]
        );
        
        return result[0].settings_data;
      } else {
        // Insert new settings
        const insertQuery = `
          INSERT INTO settings (id, business_id, category, settings_data, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING settings_data
        `;
        
        const now = new Date().toISOString();
        const result = await dbService.executeQuery(
          insertQuery,
          [nanoid(), businessId, category, settingsData, now, now]
        );
        
        return result[0].settings_data;
      }
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }
  
  /**
   * Get all staff members for a business
   */
  async getBusinessStaff(businessId: string): Promise<Tables['users'][]> {
    try {
      const query = `
        SELECT id, email, first_name, last_name, role, created_at, updated_at
        FROM users
        WHERE business_id = $1 AND role IN ('manager', 'staff')
        ORDER BY role, last_name, first_name
      `;
      
      const result = await dbService.executeQuery(query, [businessId]);
      return result as Tables['users'][];
    } catch (error) {
      console.error('Error getting business staff:', error);
      throw error;
    }
  }
}

// Create singleton instance
const businessService = new BusinessService();
export default businessService; 