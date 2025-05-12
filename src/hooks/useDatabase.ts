import { useState, useEffect } from 'react';
import { supabase } from '../config/database';
import * as programService from '../services/programService';
import * as customerService from '../services/customerService';
import * as transactionService from '../services/transactionService';
import { LoyaltyProgram, Customer, Transaction } from '../contexts/BusinessContext';

interface UseDatabaseProps {
  businessId: string | null;
}

export const useDatabase = ({ businessId }: UseDatabaseProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Programs
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  
  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  
  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  
  // Reset state when business changes
  useEffect(() => {
    setPrograms([]);
    setProgram(null);
    setCustomers([]);
    setCustomer(null);
    setTransactions([]);
    setTransaction(null);
  }, [businessId]);
  
  // Program Methods
  const fetchPrograms = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await programService.getPrograms(businessId);
      setPrograms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch programs'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProgram = async (programId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await programService.getProgram(programId);
      setProgram(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch program'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const addProgram = async (program: Omit<LoyaltyProgram, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newProgram = await programService.createProgram(program);
      setPrograms(prev => [...prev, newProgram]);
      return newProgram;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add program'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProgramById = async (programId: string, updates: Partial<LoyaltyProgram>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProgram = await programService.updateProgram(programId, updates);
      setPrograms(prev => prev.map(p => (p.id === programId ? updatedProgram : p)));
      if (program?.id === programId) {
        setProgram(updatedProgram);
      }
      return updatedProgram;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update program'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteProgramById = async (programId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await programService.deleteProgram(programId);
      setPrograms(prev => prev.filter(p => p.id !== programId));
      if (program?.id === programId) {
        setProgram(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete program'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Customer Methods
  const fetchCustomers = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await customerService.getCustomers(businessId);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCustomer = async (customerId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await customerService.getCustomer(customerId);
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newCustomer = await customerService.createCustomer(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add customer'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Transaction Methods
  const fetchTransactions = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await transactionService.getTransactions(businessId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTransaction = async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await transactionService.getTransaction(transactionId);
      setTransaction(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transaction'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newTransaction = await transactionService.createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add transaction'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Real-time subscriptions for live data updates
  useEffect(() => {
    if (!businessId) return;
    
    // Subscribe to changes in the programs table
    const programsSubscription = supabase
      .channel('public:loyalty_programs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'loyalty_programs',
        filter: `business_id=eq.${businessId}`
      }, () => {
        fetchPrograms();
      })
      .subscribe();
      
    // Subscribe to changes in the customers table
    const customersSubscription = supabase
      .channel('public:customers')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `business_id=eq.${businessId}`
      }, () => {
        fetchCustomers();
      })
      .subscribe();
      
    // Subscribe to changes in the transactions table
    const transactionsSubscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions',
        filter: `business_id=eq.${businessId}`
      }, () => {
        fetchTransactions();
      })
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(programsSubscription);
      supabase.removeChannel(customersSubscription);
      supabase.removeChannel(transactionsSubscription);
    };
  }, [businessId]);
  
  return {
    isLoading,
    error,
    
    // Programs
    programs,
    program,
    fetchPrograms,
    fetchProgram,
    addProgram,
    updateProgramById,
    deleteProgramById,
    
    // Customers
    customers,
    customer,
    fetchCustomers,
    fetchCustomer,
    addCustomer,
    
    // Transactions
    transactions,
    transaction,
    fetchTransactions,
    fetchTransaction,
    addTransaction,
  };
}; 