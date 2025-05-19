import { sql, findById, create, update, remove, findAll } from './dbService';
import { issuePoints } from './loyaltyProgramService';
import { Tables } from '../models/database.types';

type Transaction = Tables['transactions'];

/**
 * Get a transaction by ID
 * @param id The transaction ID
 * @returns The transaction or null if not found
 */
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  return await findById('transactions', id);
};

/**
 * Create a new transaction
 * @param transactionData The transaction data
 * @returns The created transaction
 */
export const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction> => {
  return await create('transactions', transactionData);
};

/**
 * Update a transaction
 * @param id The transaction ID
 * @param transactionData The updated transaction data
 * @returns The updated transaction
 */
export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<Transaction> => {
  return await update('transactions', id, transactionData);
};

/**
 * Delete a transaction
 * @param id The transaction ID
 * @returns The deleted transaction or null
 */
export const deleteTransaction = async (id: string): Promise<Transaction | null> => {
  return await remove('transactions', id);
};

/**
 * Get all transactions for a business
 * @param businessId The business ID
 * @param limit Maximum number of transactions to return
 * @param offset Number of transactions to skip
 * @returns Array of transactions
 */
export const getBusinessTransactions = async (
  businessId: string,
  limit = 100,
  offset = 0
): Promise<Transaction[]> => {
  return await findAll('transactions', { business_id: businessId }, limit, offset);
};

/**
 * Get transactions for a specific customer
 * @param customerId The customer ID
 * @param limit Maximum number of transactions to return
 * @param offset Number of transactions to skip
 * @returns Array of transactions
 */
export const getCustomerTransactions = async (
  customerId: string,
  limit = 100,
  offset = 0
): Promise<Transaction[]> => {
  return await findAll('transactions', { customer_id: customerId }, limit, offset);
};

/**
 * Record a purchase transaction and award loyalty points
 * @param data The purchase data
 * @returns The created transaction
 */
export const recordPurchase = async (data: {
  businessId: string;
  customerId: string;
  programId?: string;
  amount: number;
  pointsEarned: number;
  staffId?: string;
  notes?: string;
  receiptNumber?: string;
}): Promise<Transaction> => {
  try {
    const {
      businessId,
      customerId,
      programId,
      amount,
      pointsEarned,
      staffId,
      notes,
      receiptNumber
    } = data;
    
    // Create the transaction
    const transaction = await createTransaction({
      business_id: businessId,
      customer_id: customerId,
      program_id: programId || null,
      amount,
      points_earned: pointsEarned,
      date: new Date().toISOString(),
      type: 'purchase',
      staff_id: staffId || null,
      notes: notes || null,
      receipt_number: receiptNumber || null
    });
    
    // If a program ID was provided, issue points to the customer
    if (programId && pointsEarned > 0) {
      await issuePoints(customerId, programId, pointsEarned);
    }
    
    // Update the customer's total points
    await sql`
      UPDATE customers
      SET total_points = total_points + ${pointsEarned},
          updated_at = NOW()
      WHERE id = ${customerId}
    `;
    
    return transaction;
  } catch (error) {
    console.error('Error recording purchase:', error);
    throw error;
  }
};

/**
 * Record a reward redemption transaction
 * @param data The redemption data
 * @returns The created transaction
 */
export const recordRedemption = async (data: {
  businessId: string;
  customerId: string;
  programId: string;
  rewardId: string;
  pointsRedeemed: number;
  staffId?: string;
  notes?: string;
}): Promise<Transaction> => {
  try {
    const {
      businessId,
      customerId,
      programId,
      rewardId,
      pointsRedeemed,
      staffId,
      notes
    } = data;
    
    // Create the transaction
    const transaction = await createTransaction({
      business_id: businessId,
      customer_id: customerId,
      program_id: programId,
      amount: 0, // Redemptions typically have zero monetary value
      points_earned: -pointsRedeemed, // Negative points to indicate redemption
      date: new Date().toISOString(),
      type: 'reward_redemption',
      staff_id: staffId || null,
      notes: notes || `Redeemed reward ID: ${rewardId}`
    });
    
    // Deduct points from loyalty card
    await sql`
      UPDATE loyalty_cards
      SET points_balance = points_balance - ${pointsRedeemed},
          updated_at = NOW()
      WHERE customer_id = ${customerId} AND program_id = ${programId}
    `;
    
    // Update the customer's total points
    await sql`
      UPDATE customers
      SET total_points = total_points - ${pointsRedeemed},
          updated_at = NOW()
      WHERE id = ${customerId}
    `;
    
    return transaction;
  } catch (error) {
    console.error('Error recording redemption:', error);
    throw error;
  }
};

/**
 * Get transaction statistics for a business
 * @param businessId The business ID
 * @returns Transaction statistics
 */
export const getTransactionStats = async (businessId: string): Promise<{
  totalTransactions: number;
  transactions7Days: number;
  transactions30Days: number;
  totalVolume: number;
  averageAmount: number;
}> => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN date >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS transactions_7_days,
        SUM(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS transactions_30_days,
        SUM(amount) AS total_volume,
        AVG(amount) AS average_amount
      FROM transactions
      WHERE business_id = ${businessId} AND type = 'purchase'
    `;
    
    const stats = result[0];
    return {
      totalTransactions: parseInt(stats?.total_transactions || '0', 10),
      transactions7Days: parseInt(stats?.transactions_7_days || '0', 10),
      transactions30Days: parseInt(stats?.transactions_30_days || '0', 10),
      totalVolume: parseFloat(stats?.total_volume || '0'),
      averageAmount: parseFloat(stats?.average_amount || '0')
    };
  } catch (error) {
    console.error('Error getting transaction statistics:', error);
    throw error;
  }
}; 