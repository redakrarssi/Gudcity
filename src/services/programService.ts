import { supabase, TABLES, handleDbError } from '../config/database';
import type { Tables } from '../models/database.types';
import { LoyaltyProgram } from '../contexts/BusinessContext';

// Get all programs for a business
export const getPrograms = async (businessId: string): Promise<LoyaltyProgram[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.LOYALTY_PROGRAMS)
      .select('*')
      .eq('business_id', businessId);
      
    if (error) throw error;
    
    return data as LoyaltyProgram[];
  } catch (error) {
    return handleDbError(error, 'fetch loyalty programs');
  }
};

// Get a single program by ID
export const getProgram = async (programId: string): Promise<LoyaltyProgram | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.LOYALTY_PROGRAMS)
      .select('*')
      .eq('id', programId)
      .single();
      
    if (error) throw error;
    
    return data as LoyaltyProgram;
  } catch (error) {
    return handleDbError(error, 'fetch loyalty program');
  }
};

// Create a new program
export const createProgram = async (program: Omit<Tables['loyalty_programs'], 'id' | 'created_at' | 'updated_at'>): Promise<LoyaltyProgram> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.LOYALTY_PROGRAMS)
      .insert([{
        ...program,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return data as LoyaltyProgram;
  } catch (error) {
    return handleDbError(error, 'create loyalty program');
  }
};

// Update an existing program
export const updateProgram = async (programId: string, updates: Partial<Omit<Tables['loyalty_programs'], 'id' | 'created_at'>>): Promise<LoyaltyProgram> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.LOYALTY_PROGRAMS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as LoyaltyProgram;
  } catch (error) {
    return handleDbError(error, 'update loyalty program');
  }
};

// Delete a program
export const deleteProgram = async (programId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.LOYALTY_PROGRAMS)
      .delete()
      .eq('id', programId);
      
    if (error) throw error;
  } catch (error) {
    handleDbError(error, 'delete loyalty program');
  }
}; 