// Mock database client without any Supabase dependencies
export const mockDatabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      }),
      order: () => ({
        data: []
      })
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ error: null })
  }),
  removeChannel: () => {},
  channel: () => ({
    on: () => ({
      subscribe: () => {}
    })
  }),
  rpc: async () => ({ error: null })
};

// Database table names
export const TABLES = {
  BUSINESSES: 'businesses',
  USERS: 'users',
  CUSTOMERS: 'customers',
  LOYALTY_PROGRAMS: 'loyalty_programs',
  TRANSACTIONS: 'transactions',
  REWARDS: 'rewards',
  LOYALTY_CARDS: 'loyalty_cards',
  SETTINGS: 'settings'
};

// Helper function to handle database errors
export const handleDbError = (error: any, operation: string) => {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message || 'Unknown database error'}`);
};

// Re-export mockDatabase as supabase for compatibility with existing code
export const supabase = mockDatabase; 