import { supabase, TABLES, handleDbError } from '../config/database';
import type { Tables } from '../models/database.types';
import { Transaction } from '../contexts/BusinessContext';

// Get all transactions for a business
export const getTransactions = async (businessId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*, customers(first_name, last_name, email)')
      .eq('business_id', businessId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return data as Transaction[];
  } catch (error) {
    return handleDbError(error, 'fetch transactions');
  }
};

// Get transactions for a specific customer
export const getCustomerTransactions = async (customerId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return data as Transaction[];
  } catch (error) {
    return handleDbError(error, 'fetch customer transactions');
  }
};

// Create a new transaction and update loyalty points
export const createTransaction = async (transaction: Omit<Tables['transactions'], 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
  // Start a Supabase transaction (not fully supported yet in JS client, so we use multiple operations)
  try {
    // 1. Insert the transaction
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert([{
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // 2. Update customer's total points for purchase or subtract for redemption
    if (transaction.type === 'purchase') {
      const { error: updateError } = await supabase.rpc('increment_customer_points', {
        p_customer_id: transaction.customer_id,
        p_points_amount: transaction.points_earned
      });
      
      if (updateError) throw updateError;
      
      // 3. Update loyalty card points balance
      if (transaction.program_id) {
        const { error: cardError } = await supabase.rpc('increment_loyalty_card_points', {
          p_customer_id: transaction.customer_id,
          p_program_id: transaction.program_id,
          p_points_amount: transaction.points_earned
        });
        
        if (cardError) throw cardError;
      }
    } else if (transaction.type === 'reward_redemption') {
      // For redemptions, subtract points
      const { error: updateError } = await supabase.rpc('decrement_customer_points', {
        p_customer_id: transaction.customer_id,
        p_points_amount: Math.abs(transaction.points_earned) // points_earned should be negative for redemptions
      });
      
      if (updateError) throw updateError;
      
      // Update loyalty card points balance
      if (transaction.program_id) {
        const { error: cardError } = await supabase.rpc('decrement_loyalty_card_points', {
          p_customer_id: transaction.customer_id,
          p_program_id: transaction.program_id,
          p_points_amount: Math.abs(transaction.points_earned)
        });
        
        if (cardError) throw cardError;
      }
    }
    
    return data as Transaction;
  } catch (error) {
    return handleDbError(error, 'create transaction');
  }
};

// Get a single transaction by ID
export const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*, customers(first_name, last_name, email)')
      .eq('id', transactionId)
      .single();
      
    if (error) throw error;
    
    return data as Transaction;
  } catch (error) {
    return handleDbError(error, 'fetch transaction');
  }
}; 