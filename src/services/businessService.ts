import { sql, findById, create, update, remove, findAll } from './dbService';
import { Tables } from '../models/database.types';
import { nanoid } from 'nanoid';

type Business = Tables['businesses'];

/**
 * Business Service
 * Handles business-related operations against the database
 */
class BusinessService {
  /**
   * Get a business by ID
   */
  async getBusinessById(businessId: string): Promise<Business | null> {
    return await findById('businesses', businessId);
  }
  
  /**
   * Get a business by owner ID
   */
  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    return await findById('businesses', ownerId);
  }
  
  /**
   * Update business profile
   */
  async updateBusinessProfile(
    businessId: string,
    updates: Partial<Business>
  ): Promise<Business> {
    return await update('businesses', businessId, updates);
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
    // Implementation of getBusinessStats method
    throw new Error('Method not implemented');
  }
  
  /**
   * Get business settings
   */
  async getBusinessSettings(
    businessId: string,
    category: string
  ): Promise<Record<string, any>> {
    // Implementation of getBusinessSettings method
    throw new Error('Method not implemented');
  }
  
  /**
   * Update business settings
   */
  async updateBusinessSettings(
    businessId: string,
    category: string,
    settingsData: Record<string, any>
  ): Promise<Record<string, any>> {
    // Implementation of updateBusinessSettings method
    throw new Error('Method not implemented');
  }
  
  /**
   * Get all staff members for a business
   */
  async getBusinessStaff(businessId: string): Promise<Tables['users'][]> {
    // Implementation of getBusinessStaff method
    throw new Error('Method not implemented');
  }
}

// Create singleton instance
const businessService = new BusinessService();

/**
 * Get a business by its ID
 * @param id The business ID
 * @returns The business or null if not found
 */
export const getBusinessById = async (id: string): Promise<Business | null> => {
  return await findById('businesses', id);
};

/**
 * Create a new business
 * @param businessData The business data
 * @returns The created business
 */
export const createBusiness = async (businessData: Partial<Business>): Promise<Business> => {
  return await create('businesses', businessData);
};

/**
 * Update a business
 * @param id The business ID
 * @param businessData The updated business data
 * @returns The updated business
 */
export const updateBusiness = async (id: string, businessData: Partial<Business>): Promise<Business> => {
  return await update('businesses', id, businessData);
};

/**
 * Delete a business
 * @param id The business ID
 * @returns The deleted business or null
 */
export const deleteBusiness = async (id: string): Promise<Business | null> => {
  return await remove('businesses', id);
};

/**
 * Get all businesses
 * @param limit Maximum number of businesses to return
 * @param offset Number of businesses to skip
 * @returns Array of businesses
 */
export const getAllBusinesses = async (limit = 100, offset = 0): Promise<Business[]> => {
  return await findAll('businesses', {}, limit, offset);
};

/**
 * Get businesses by owner ID
 * @param ownerId The owner's ID
 * @param limit Maximum number of businesses to return
 * @param offset Number of businesses to skip
 * @returns Array of businesses owned by the specified user
 */
export const getBusinessesByOwnerId = async (ownerId: string, limit = 100, offset = 0): Promise<Business[]> => {
  return await findAll('businesses', { owner_id: ownerId }, limit, offset);
};

/**
 * Search for businesses by name
 * @param searchTerm The search term to look for in business names
 * @returns Array of matching businesses
 */
export const searchBusinessesByName = async (searchTerm: string): Promise<Business[]> => {
  try {
    const result = await sql`
      SELECT * FROM businesses
      WHERE name ILIKE ${`%${searchTerm}%`}
      ORDER BY name
      LIMIT 20
    `;
    return result as Business[];
  } catch (error) {
    console.error('Error searching businesses:', error);
    throw error;
  }
};

export default businessService; 