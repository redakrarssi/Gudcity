import { sql, findById, create, update, remove, findAll } from './dbService';
import { Tables } from '../models/database.types';

type Reward = Tables['rewards'];

/**
 * Get a reward by ID
 * @param id The reward ID
 * @returns The reward or null if not found
 */
export const getRewardById = async (id: string): Promise<Reward | null> => {
  return await findById('rewards', id);
};

/**
 * Create a new reward
 * @param rewardData The reward data
 * @returns The created reward
 */
export const createReward = async (rewardData: Partial<Reward>): Promise<Reward> => {
  return await create('rewards', rewardData);
};

/**
 * Update a reward
 * @param id The reward ID
 * @param rewardData The updated reward data
 * @returns The updated reward
 */
export const updateReward = async (id: string, rewardData: Partial<Reward>): Promise<Reward> => {
  return await update('rewards', id, rewardData);
};

/**
 * Delete a reward
 * @param id The reward ID
 * @returns The deleted reward or null
 */
export const deleteReward = async (id: string): Promise<Reward | null> => {
  return await remove('rewards', id);
};

/**
 * Get all rewards for a business
 * @param businessId The business ID
 * @param includeInactive Whether to include inactive rewards
 * @returns Array of rewards
 */
export const getBusinessRewards = async (businessId: string, includeInactive = false): Promise<Reward[]> => {
  try {
    let query = sql`
      SELECT * FROM rewards
      WHERE business_id = ${businessId}
    `;
    
    if (!includeInactive) {
      query = sql`
        ${query} AND active = true
      `;
    }
    
    query = sql`
      ${query} ORDER BY points_required
    `;
    
    const result = await query;
    return result as Reward[];
  } catch (error) {
    console.error('Error getting business rewards:', error);
    throw error;
  }
};

/**
 * Get all rewards for a specific loyalty program
 * @param programId The program ID
 * @param includeInactive Whether to include inactive rewards
 * @returns Array of rewards
 */
export const getProgramRewards = async (programId: string, includeInactive = false): Promise<Reward[]> => {
  try {
    let query = sql`
      SELECT * FROM rewards
      WHERE program_id = ${programId}
    `;
    
    if (!includeInactive) {
      query = sql`
        ${query} AND active = true
      `;
    }
    
    query = sql`
      ${query} ORDER BY points_required
    `;
    
    const result = await query;
    return result as Reward[];
  } catch (error) {
    console.error('Error getting program rewards:', error);
    throw error;
  }
};

/**
 * Check if a customer has enough points to redeem a reward
 * @param customerId The customer ID
 * @param rewardId The reward ID
 * @returns Whether the customer can redeem the reward and the reward details
 */
export const checkRewardEligibility = async (customerId: string, rewardId: string): Promise<{
  eligible: boolean;
  reward: Reward | null;
  pointsNeeded: number;
  currentPoints: number;
}> => {
  try {
    // Get the reward
    const reward = await getRewardById(rewardId);
    
    if (!reward) {
      return {
        eligible: false,
        reward: null,
        pointsNeeded: 0,
        currentPoints: 0
      };
    }
    
    // Get the loyalty card for this program
    const result = await sql`
      SELECT points_balance
      FROM loyalty_cards
      WHERE customer_id = ${customerId}
      AND program_id = ${reward.program_id}
      LIMIT 1
    `;
    
    const currentPoints = result[0]?.points_balance || 0;
    
    return {
      eligible: currentPoints >= reward.points_required,
      reward,
      pointsNeeded: reward.points_required,
      currentPoints
    };
  } catch (error) {
    console.error('Error checking reward eligibility:', error);
    throw error;
  }
}; 