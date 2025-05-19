import { sql, findById, create, update, remove, findAll } from './dbService';
import { Tables } from '../models/database.types';
import { nanoid } from 'nanoid';

type Customer = Tables['customers'];

/**
 * Customer Service
 * Manages customer data and operations
 */
class CustomerService {
  /**
   * Get a customer by ID
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    return await findById('customers', customerId);
  }
  
  /**
   * Get a customer by user ID
   */
  async getCustomerByUserId(userId: string): Promise<Customer | null> {
    try {
      const result = await sql`
        SELECT * FROM customers
        WHERE user_id = ${userId}
        LIMIT 1
      `;
      return result[0] as Customer || null;
    } catch (error) {
      console.error('Error fetching customer by user ID:', error);
      throw error;
    }
  }
  
  /**
   * Get customers for a business
   */
  async getBusinessCustomers(
    businessId: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      searchTerm?: string;
    } = {}
  ): Promise<{
    customers: Customer[];
    total: number;
  }> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        sortBy = 'sign_up_date', 
        sortDirection = 'desc',
        searchTerm = '' 
      } = options;
      
      // Build WHERE clause
      let whereConditions = [`business_id = $1`];
      const params = [businessId];
      
      if (searchTerm) {
        whereConditions.push(`(
          first_name ILIKE $2 OR 
          last_name ILIKE $2 OR 
          email ILIKE $2 OR 
          phone ILIKE $2
        )`);
        params.push(`%${searchTerm}%`);
      }
      
      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      
      // Build ORDER BY clause
      const validSortColumns = [
        'first_name', 'last_name', 'email', 'sign_up_date', 'total_points'
      ];
      const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'sign_up_date';
      const orderDirection = sortDirection === 'asc' ? 'ASC' : 'DESC';
      
      const orderClause = `ORDER BY ${orderBy} ${orderDirection}`;
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM customers
        ${whereClause}
      `;
      
      const countResult = await sql`${countQuery}`, params;
      const total = parseInt(countResult[0]?.total);
      
      // Get paginated results
      const query = `
        SELECT *
        FROM customers
        ${whereClause}
        ${orderClause}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const result = await sql`${query}`, params;
      
      return {
        customers: result as Customer[],
        total
      };
    } catch (error) {
      console.error('Error getting business customers:', error);
      throw error;
    }
  }
  
  /**
   * Get a customer's loyalty cards
   */
  async getCustomerLoyaltyCards(
    customerId: string,
    businessId?: string
  ): Promise<Tables['loyalty_cards'][]> {
    try {
      let query = `
        SELECT lc.*
        FROM loyalty_cards lc
        JOIN loyalty_programs lp ON lc.program_id = lp.id
        WHERE lc.customer_id = $1
      `;
      
      const params = [customerId];
      
      if (businessId) {
        query += ` AND lc.business_id = $2`;
        params.push(businessId);
      }
      
      query += ` ORDER BY lp.name ASC`;
      
      const result = await sql`${query}`, params;
      return result as Tables['loyalty_cards'][];
    } catch (error) {
      console.error('Error getting customer loyalty cards:', error);
      throw error;
    }
  }
  
  /**
   * Get customer transactions
   */
  async getCustomerTransactions(
    customerId: string,
    options: {
      limit?: number;
      offset?: number;
      businessId?: string;
      transactionType?: 'purchase' | 'refund' | 'reward_redemption';
    } = {}
  ): Promise<{
    transactions: Tables['transactions'][];
    total: number;
  }> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        businessId,
        transactionType 
      } = options;
      
      // Build WHERE clause
      let whereConditions = [`customer_id = $1`];
      const params = [customerId];
      
      if (businessId) {
        whereConditions.push(`business_id = $${params.length + 1}`);
        params.push(businessId);
      }
      
      if (transactionType) {
        whereConditions.push(`type = $${params.length + 1}`);
        params.push(transactionType);
      }
      
      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM transactions
        ${whereClause}
      `;
      
      const countResult = await sql`${countQuery}`, params;
      const total = parseInt(countResult[0]?.total);
      
      // Get paginated results
      const query = `
        SELECT t.*, 
          b.name as business_name,
          lp.name as program_name
        FROM transactions t
        LEFT JOIN businesses b ON t.business_id = b.id
        LEFT JOIN loyalty_programs lp ON t.program_id = lp.id
        ${whereClause}
        ORDER BY t.date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const result = await sql`${query}`, params;
      
      return {
        transactions: result as Tables['transactions'][],
        total
      };
    } catch (error) {
      console.error('Error getting customer transactions:', error);
      throw error;
    }
  }
  
  /**
   * Update customer profile
   */
  async updateCustomerProfile(
    customerId: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    return await update('customers', customerId, updates);
  }
  
  /**
   * Add a new customer for a business
   */
  async addCustomer(
    businessId: string,
    customerData: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      address?: string;
      birthday?: string;
      notes?: string;
    }
  ): Promise<Customer> {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        address, 
        birthday, 
        notes 
      } = customerData;
      
      // Check if customer already exists with this email at this business
      const checkQuery = `
        SELECT id FROM customers
        WHERE business_id = $1 AND email = $2
        LIMIT 1
      `;
      
      const checkResult = await sql`${checkQuery}`, [businessId, email];
      
      if (checkResult.length > 0) {
        throw new Error('A customer with this email already exists for this business');
      }
      
      // Insert new customer
      const insertQuery = `
        INSERT INTO customers (
          id, business_id, first_name, last_name, email, phone, address,
          sign_up_date, total_points, birthday, notes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        RETURNING *
      `;
      
      const now = new Date().toISOString();
      const id = nanoid();
      
      // Fix for the linter error - explicitly casting null values to string or null
      const phoneValue = phone || null;
      const addressValue = address || null;
      const birthdayValue = birthday || null;
      const notesValue = notes || null;
      
      const params = [
        id,
        businessId,
        firstName,
        lastName,
        email,
        phoneValue,
        addressValue,
        now,
        0, // Initial points
        birthdayValue,
        notesValue,
        now,
        now
      ];
      
      const result = await sql`${insertQuery}`, params;
      return result[0] as Customer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }
  
  /**
   * Get customer summary statistics
   */
  async getCustomerSummary(
    customerId: string
  ): Promise<{
    totalPoints: number;
    availableRewards: number;
    totalTransactions: number;
    activePrograms: number;
    recentTransactions: Tables['transactions'][];
  }> {
    try {
      // Get total points
      const pointsQuery = `
        SELECT total_points
        FROM customers
        WHERE id = $1
        LIMIT 1
      `;
      
      // Get transaction count
      const transactionCountQuery = `
        SELECT COUNT(*) as total
        FROM transactions
        WHERE customer_id = $1
      `;
      
      // Get active programs count
      const programsQuery = `
        SELECT COUNT(DISTINCT program_id) as total
        FROM loyalty_cards
        WHERE customer_id = $1 AND active = true
      `;
      
      // Get available rewards count
      const rewardsQuery = `
        SELECT COUNT(*) as total
        FROM rewards r
        JOIN loyalty_cards lc ON r.program_id = lc.program_id
        WHERE 
          lc.customer_id = $1 AND 
          lc.active = true AND 
          r.active = true AND
          lc.points_balance >= r.points_required
      `;
      
      // Get recent transactions
      const recentTransactionsQuery = `
        SELECT t.*, 
          b.name as business_name,
          lp.name as program_name
        FROM transactions t
        LEFT JOIN businesses b ON t.business_id = b.id
        LEFT JOIN loyalty_programs lp ON t.program_id = lp.id
        WHERE t.customer_id = $1
        ORDER BY t.date DESC
        LIMIT 5
      `;
      
      // Execute all queries
      const [
        pointsResult,
        transactionCountResult,
        programsResult,
        rewardsResult,
        recentTransactionsResult
      ] = await Promise.all([
        sql`${pointsQuery}`, [customerId],
        sql`${transactionCountQuery}`, [customerId],
        sql`${programsQuery}`, [customerId],
        sql`${rewardsQuery}`, [customerId],
        sql`${recentTransactionsQuery}`, [customerId]
      ]);
      
      return {
        totalPoints: parseInt(pointsResult[0]?.total_points || '0'),
        totalTransactions: parseInt(transactionCountResult[0]?.total || '0'),
        activePrograms: parseInt(programsResult[0]?.total || '0'),
        availableRewards: parseInt(rewardsResult[0]?.total || '0'),
        recentTransactions: recentTransactionsResult as Tables['transactions'][]
      };
    } catch (error) {
      console.error('Error getting customer summary:', error);
      throw error;
    }
  }
}

// Create singleton instance
const customerService = new CustomerService();
export default customerService; 