import { sql, findById, create, update, remove, findAll } from './dbService';
import { Tables } from '../models/database.types';

type LoyaltyProgram = Tables['loyalty_programs'];

/**
 * Get a loyalty program by ID
 * @param id The program ID
 * @returns The program or null if not found
 */
export const getLoyaltyProgramById = async (id: string): Promise<LoyaltyProgram | null> => {
  return await findById('loyalty_programs', id);
};

/**
 * Create a new loyalty program
 * @param programData The program data
 * @returns The created program
 */
export const createLoyaltyProgram = async (programData: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> => {
  return await create('loyalty_programs', programData);
};

/**
 * Update a loyalty program
 * @param id The program ID
 * @param programData The updated program data
 * @returns The updated program
 */
export const updateLoyaltyProgram = async (id: string, programData: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> => {
  return await update('loyalty_programs', id, programData);
};

/**
 * Delete a loyalty program
 * @param id The program ID
 * @returns The deleted program or null
 */
export const deleteLoyaltyProgram = async (id: string): Promise<LoyaltyProgram | null> => {
  return await remove('loyalty_programs', id);
};

/**
 * Get all loyalty programs for a business
 * @param businessId The business ID
 * @param includeInactive Whether to include inactive programs
 * @returns Array of loyalty programs
 */
export const getBusinessLoyaltyPrograms = async (businessId: string, includeInactive = false): Promise<LoyaltyProgram[]> => {
  try {
    let query = sql`
      SELECT * FROM loyalty_programs
      WHERE business_id = ${businessId}
    `;
    
    if (!includeInactive) {
      query = sql`
        ${query} AND active = true
      `;
    }
    
    query = sql`
      ${query} ORDER BY name
    `;
    
    const result = await query;
    return result as LoyaltyProgram[];
  } catch (error) {
    console.error('Error getting business loyalty programs:', error);
    throw error;
  }
};

/**
 * Get active loyalty programs for a business
 * @param businessId The business ID
 * @returns Array of active loyalty programs
 */
export const getActivePrograms = async (businessId: string): Promise<LoyaltyProgram[]> => {
  return await getBusinessLoyaltyPrograms(businessId, false);
};

/**
 * Get rewards associated with a loyalty program
 * @param programId The program ID
 * @returns Array of rewards for the program
 */
export const getProgramRewards = async (programId: string): Promise<Tables['rewards'][]> => {
  try {
    const result = await sql`
      SELECT * FROM rewards
      WHERE program_id = ${programId}
      ORDER BY points_required
    `;
    return result as Tables['rewards'][];
  } catch (error) {
    console.error('Error getting program rewards:', error);
    throw error;
  }
};

/**
 * Get loyalty card for customer and program
 * @param customerId The customer ID
 * @param programId The program ID
 * @returns The loyalty card or null if not found
 */
export const getCustomerLoyaltyCard = async (customerId: string, programId: string): Promise<Tables['loyalty_cards'] | null> => {
  try {
    const result = await sql`
      SELECT * FROM loyalty_cards
      WHERE customer_id = ${customerId} AND program_id = ${programId}
      LIMIT 1
    `;
    return result[0] as Tables['loyalty_cards'] || null;
  } catch (error) {
    console.error('Error getting customer loyalty card:', error);
    throw error;
  }
};

/**
 * Issue points to a customer
 * @param customerId The customer ID
 * @param programId The program ID
 * @param points Number of points to issue
 * @returns The updated loyalty card
 */
export const issuePoints = async (customerId: string, programId: string, points: number): Promise<Tables['loyalty_cards']> => {
  try {
    // First check if the customer already has a loyalty card for this program
    const existingCard = await getCustomerLoyaltyCard(customerId, programId);
    
    if (existingCard) {
      // Update existing card
      const result = await sql`
        UPDATE loyalty_cards
        SET points_balance = points_balance + ${points},
            updated_at = NOW()
        WHERE id = ${existingCard.id}
        RETURNING *
      `;
      return result[0] as Tables['loyalty_cards'];
    } else {
      // Get the business ID from the program
      const program = await getLoyaltyProgramById(programId);
      if (!program) {
        throw new Error('Loyalty program not found');
      }
      
      // Create a new loyalty card
      const result = await sql`
        INSERT INTO loyalty_cards (
          id, business_id, customer_id, program_id, points_balance, 
          tier, issue_date, active, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), ${program.business_id}, ${customerId}, ${programId}, ${points},
          'Bronze', NOW(), true, NOW(), NOW()
        )
        RETURNING *
      `;
      return result[0] as Tables['loyalty_cards'];
    }
  } catch (error) {
    console.error('Error issuing points:', error);
    throw error;
  }
}; 