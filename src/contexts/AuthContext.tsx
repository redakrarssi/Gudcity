import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define User type
export interface User {
  uid: string;
  email: string;
  role: 'business' | 'customer' | 'admin';
  businessId?: string;
  customerId?: string;
  displayName?: string;
  points?: number;
}

// Define context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'business' | 'customer', businessName?: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUserRole: (role: 'business' | 'customer' | 'admin') => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for testing
const MOCK_USERS = {
  business: {
    uid: 'mock-business-uid',
    email: 'business@example.com',
    role: 'business' as const,
    businessId: 'mock-business-id',
    displayName: 'Mock Business',
  },
  customer: {
    uid: 'mock-customer-uid',
    email: 'customer@example.com',
    role: 'customer' as const,
    customerId: 'mock-customer-id',
    displayName: 'Mock Customer',
    points: 350,
  },
  admin: {
    uid: 'mock-admin-uid',
    email: 'admin@example.com',
    role: 'admin' as const,
    displayName: 'Admin User',
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Set default user as customer for bypassing auth
  const [user, setUser] = useState<User | null>(MOCK_USERS.customer);
  const [loading, setLoading] = useState(false);

  // Auth methods (simplified for bypassing)
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Determine which mock user to use based on email
      if (email.includes('business')) {
        setUser(MOCK_USERS.business);
      } else if (email.includes('customer')) {
        setUser(MOCK_USERS.customer);
      } else if (email.includes('admin')) {
        setUser(MOCK_USERS.admin);
      } else {
        // Default to customer user
        setUser(MOCK_USERS.customer);
      }
      console.log('Signed in as:', email);
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: 'business' | 'customer', businessName?: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      // Always succeed and set the user based on the selected role
      if (role === 'business') {
        setUser({ 
          ...MOCK_USERS.business, 
          email,
          displayName: businessName || 'Mock Business'
        });
        console.log('Signed up as business:', email, 'with name:', businessName, 'and phone:', phoneNumber);
      } else {
        setUser({ ...MOCK_USERS.customer, email });
        console.log('Signed up as customer:', email);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signed out');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  // Function to easily switch between user roles for testing
  const setUserRole = (role: 'business' | 'customer' | 'admin') => {
    if (role === 'business') {
      setUser(MOCK_USERS.business);
    } else if (role === 'customer') {
      setUser(MOCK_USERS.customer);
    } else if (role === 'admin') {
      setUser(MOCK_USERS.admin);
    }
    console.log(`Switched to ${role} role`);
  };

  // Set up mock authentication bypass
  useEffect(() => {
    console.log('AUTH BYPASSED: Using mock customer account by default');
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// For compatibility with existing code
export const useAuthContext = useAuth;