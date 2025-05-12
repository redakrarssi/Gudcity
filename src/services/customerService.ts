import { supabase, TABLES, handleDbError } from '../config/database';
import type { Tables } from '../models/database.types';
import { Customer } from '../contexts/BusinessContext';

// Get all customers for a business
export const getCustomers = async (businessId: string): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('*, loyalty_cards(*)')
      .eq('business_id', businessId);
      
    if (error) throw error;
    
    return data as Customer[];
  } catch (error) {
    return handleDbError(error, 'fetch customers');
  }
};

// Get a single customer by ID
export const getCustomer = async (customerId: string): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('*, loyalty_cards(*), transactions(*)')
      .eq('id', customerId)
      .single();
      
    if (error) throw error;
    
    return data as Customer;
  } catch (error) {
    return handleDbError(error, 'fetch customer');
  }
};

// Create a new customer
export const createCustomer = async (customer: Omit<Tables['customers'], 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  try {
    // First create the customer
    const { data, error } = await supabase
      .from(TABLES.CUSTOMERS)
      .insert([{
        ...customer,
        total_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Customer;
  } catch (error) {
    return handleDbError(error, 'create customer');
  }
};

// Update an existing customer
export const updateCustomer = async (customerId: string, updates: Partial<Omit<Tables['customers'], 'id' | 'created_at'>>): Promise<Customer> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CUSTOMERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Customer;
  } catch (error) {
    return handleDbError(error, 'update customer');
  }
};

// Delete a customer
export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.CUSTOMERS)
      .delete()
      .eq('id', customerId);
      
    if (error) throw error;
  } catch (error) {
    handleDbError(error, 'delete customer');
  }
};

// Assign a loyalty card to a customer
export const assignLoyaltyCard = async (cardData: Omit<Tables['loyalty_cards'], 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.LOYALTY_CARDS)
      .insert([{
        ...cardData,
        points_balance: 0,
        punch_count: cardData.punch_count || 0,
        issue_date: new Date().toISOString(),
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      
    if (error) throw error;
  } catch (error) {
    handleDbError(error, 'assign loyalty card');
  }
}; 