import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface LoyaltyProgram {
  id: string;
  name: string;
  type: 'points' | 'punchcard' | 'tiered';
  description: string;
  rules: {
    pointsPerDollar?: number;
    punchesNeeded?: number;
    tiers?: { name: string; threshold: number; benefits: string[] }[];
  };
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string;
  points: number;
  visits: number;
  totalSpent: number;
  lastVisit: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  pointsEarned: number;
  type: 'purchase' | 'redemption';
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  active: boolean;
}

export interface Business {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  industry: string;
  programs: LoyaltyProgram[];
  customers: Customer[];
  transactions: Transaction[];
  rewards: Reward[];
  metrics: {
    totalMembers: number;
    activeMembers: number;
    pointsIssued: number;
    pointsRedeemed: number;
    repeatRate: number;
    averageOrderValue: number;
  };
}

// Types for mock data
export type MockDataProp = 'programs' | 'customers' | 'transactions' | 'rewards';

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
  saveBusiness: (data: Partial<Business>) => void;
  addProgram: (program: LoyaltyProgram) => void;
  addCustomer: (customer: Customer) => void;
  addTransaction: (transaction: Transaction) => void;
  addReward: (reward: Reward) => void;
  updateProgram: (program: LoyaltyProgram) => void;
  deleteProgram: (programId: string) => void;
}

// Pre-populated mock data
const mockPrograms: LoyaltyProgram[] = [
  {
    id: "program-1",
    name: "GudPoints",
    type: "points",
    description: "Earn points with every purchase and redeem for rewards",
    rules: {
      pointsPerDollar: 10
    },
    active: true
  },
  {
    id: "program-2",
    name: "Coffee Stamps",
    type: "punchcard",
    description: "Buy 9 coffees, get 1 free",
    rules: {
      punchesNeeded: 10
    },
    active: true
  }
];

const mockCustomers: Customer[] = [
  {
    id: "customer-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567",
    dateJoined: "2023-01-15",
    points: 450,
    visits: 12,
    totalSpent: 235.75,
    lastVisit: "2023-05-01"
  },
  {
    id: "customer-2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-987-6543",
    dateJoined: "2023-02-10",
    points: 780,
    visits: 25,
    totalSpent: 412.50,
    lastVisit: "2023-05-06"
  },
  {
    id: "customer-3",
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: "555-444-3333",
    dateJoined: "2023-03-05",
    points: 120,
    visits: 5,
    totalSpent: 65.25,
    lastVisit: "2023-04-28"
  }
];

const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    customerId: "customer-1",
    customerName: "John Doe",
    date: "2023-05-01",
    amount: 15.75,
    pointsEarned: 157,
    type: "purchase"
  },
  {
    id: "tx-2",
    customerId: "customer-2",
    customerName: "Jane Smith",
    date: "2023-05-06",
    amount: 22.50,
    pointsEarned: 225,
    type: "purchase"
  },
  {
    id: "tx-3",
    customerId: "customer-2",
    customerName: "Jane Smith",
    date: "2023-05-02",
    amount: 0,
    pointsEarned: 200,
    type: "redemption"
  }
];

const mockRewards: Reward[] = [
  {
    id: "reward-1",
    name: "Free Coffee",
    description: "Redeem for a free coffee of any size",
    pointsCost: 200,
    active: true
  },
  {
    id: "reward-2",
    name: "Pastry Discount",
    description: "50% off any pastry",
    pointsCost: 150,
    active: true
  },
  {
    id: "reward-3",
    name: "Loyalty Member Mug",
    description: "Exclusive mug for our loyal customers",
    pointsCost: 500,
    active: true
  }
];

// Storage key for localStorage
const BUSINESS_STORAGE_KEY = 'gudcity-business-data';

// Helper function to safely parse localStorage data
const getStoredBusinessData = (): Business | null => {
  try {
    const storedData = localStorage.getItem(BUSINESS_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Error parsing business data from localStorage:', error);
    return null;
  }
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Initialize state from localStorage or null
  const [business, setBusiness] = useState<Business | null>(() => {
    // Try to get data from localStorage first
    const storedData = getStoredBusinessData();
    if (storedData) {
      console.log('Loaded business data from localStorage');
      return storedData;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);

  // Load initial business data if not in localStorage
  useEffect(() => {
    if (!business && user) {
      // Mock business with pre-populated data
      const mockBusiness: Business = {
        id: user.businessId || "mock-business-id",
        name: "GudCity Coffee",
        logo: "https://placehold.co/100x100.png",
        primaryColor: "#4284FB",
        secondaryColor: "#FFB81C",
        industry: "Food & Beverage",
        programs: mockPrograms,
        customers: mockCustomers,
        transactions: mockTransactions,
        rewards: mockRewards,
        metrics: {
          totalMembers: mockCustomers.length,
          activeMembers: mockCustomers.filter(c => new Date(c.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
          pointsIssued: mockTransactions.filter(t => t.type === 'purchase').reduce((sum, tx) => sum + tx.pointsEarned, 0),
          pointsRedeemed: mockTransactions.filter(t => t.type === 'redemption').reduce((sum, tx) => sum + tx.pointsEarned, 0),
          repeatRate: 0.68, // 68% of customers return
          averageOrderValue: mockTransactions.filter(t => t.type === 'purchase').reduce((sum, tx) => sum + tx.amount, 0) / 
                             mockTransactions.filter(t => t.type === 'purchase').length
        }
      };
      
      setBusiness(mockBusiness);
    }
    
    setLoading(false);
  }, [business, user]);
  
  // Persist business data to localStorage whenever it changes
  useEffect(() => {
    if (business) {
      try {
        localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(business));
        console.log('Saved business data to localStorage');
      } catch (error) {
        console.error('Error saving business data to localStorage:', error);
      }
    }
  }, [business]);

  // Mock data functions to simulate database operations
  const saveBusiness = (data: Partial<Business>) => {
    setBusiness(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      return updated;
    });
  };

  const addProgram = (program: LoyaltyProgram) => {
    setBusiness(prev => {
      if (!prev) return null;
      return {
        ...prev,
        programs: [...prev.programs, program],
        metrics: { ...prev.metrics }
      };
    });
  };

  const addCustomer = (customer: Customer) => {
    setBusiness(prev => {
      if (!prev) return null;
      return {
        ...prev,
        customers: [...prev.customers, customer],
        metrics: {
          ...prev.metrics,
          totalMembers: prev.metrics.totalMembers + 1,
          activeMembers: prev.metrics.activeMembers + 1
        }
      };
    });
  };

  const addTransaction = (transaction: Transaction) => {
    setBusiness(prev => {
      if (!prev) return null;
      return {
        ...prev,
        transactions: [...prev.transactions, transaction],
        metrics: {
          ...prev.metrics,
          pointsIssued: prev.metrics.pointsIssued + (transaction.type === 'purchase' ? transaction.pointsEarned : 0),
          pointsRedeemed: prev.metrics.pointsRedeemed + (transaction.type === 'redemption' ? transaction.pointsEarned : 0)
        }
      };
    });
  };

  const addReward = (reward: Reward) => {
    setBusiness(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rewards: [...prev.rewards, reward]
      };
    });
  };

  const updateProgram = (program: LoyaltyProgram) => {
    setBusiness(prev => {
      if (!prev) return prev;
      
      const updatedPrograms = prev.programs.map(p => 
        p.id === program.id ? program : p
      );
      
      return {
        ...prev,
        programs: updatedPrograms
      };
    });
  };
  
  const deleteProgram = (programId: string) => {
    setBusiness(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        programs: prev.programs.filter(p => p.id !== programId)
      };
    });
  };

  const value = {
    business,
    loading,
    saveBusiness,
    addProgram,
    addCustomer,
    addTransaction,
    addReward,
    updateProgram,
    deleteProgram
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};