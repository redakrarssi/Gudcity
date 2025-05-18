import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

// Define context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'admin' | 'manager' | 'staff' | 'customer', firstName?: string, lastName?: string, businessName?: string, phoneNumber?: string, address?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUserRole: (role: 'admin' | 'manager' | 'staff' | 'customer') => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USER_STORAGE_KEY = 'gudcity-user-data';
const USER_ROLE_KEY = 'userRole';

// Mock users for testing - used as fallbacks if database connection fails
const MOCK_USERS = {
  business: {
    id: 'mock-business-uid',
    email: 'business@example.com',
    role: 'manager' as const,
    businessId: 'mock-business-id',
    firstName: 'Business',
    lastName: 'Owner',
    displayName: 'Business Owner',
  },
  customer: {
    id: 'mock-customer-uid',
    email: 'customer@example.com',
    role: 'customer' as const,
    customerId: 'mock-customer-id',
    firstName: 'Mock',
    lastName: 'Customer',
    displayName: 'Mock Customer',
  },
  admin: {
    id: 'mock-admin-uid',
    email: 'admin@example.com',
    role: 'admin' as const,
    displayName: 'Admin User',
  }
};

// Helper function to safely parse localStorage data
const getStoredUserData = (): User | null => {
  try {
    const storedData = localStorage.getItem(USER_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState<User | null>(() => {
    return getStoredUserData();
  });
  const [loading, setLoading] = useState(true);

  // Persist user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(USER_ROLE_KEY, user.role);
        console.log('User data saved to localStorage');
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }
    } else {
      // Clear storage on logout
      localStorage.removeItem(USER_STORAGE_KEY);
      // We might want to keep the role preference
    }
  }, [user]);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.signIn(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        console.log('Signed in as:', email, 'with role:', loggedInUser.role);
      } else {
        // Fall back to mock users if database connection fails
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
        console.log('Signed in with mock user as:', email);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Fall back to mock users
      setUser(MOCK_USERS.customer);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'admin' | 'manager' | 'staff' | 'customer',
    firstName?: string,
    lastName?: string,
    businessName?: string,
    phoneNumber?: string,
    address?: string
  ) => {
    setLoading(true);
    try {
      const newUser = await authService.signUp(
        email, 
        password, 
        role, 
        firstName, 
        lastName, 
        businessName, 
        phoneNumber, 
        address
      );
      
      if (newUser) {
        setUser(newUser);
        console.log('Signed up as:', role, 'with email:', email);
      } else {
        // Fall back to mock users
        if (role === 'manager' || role === 'admin') {
          setUser({ 
            ...MOCK_USERS.business, 
            email,
            firstName: firstName || 'Business',
            lastName: lastName || 'Owner',
            displayName: businessName || 'Mock Business'
          });
        } else {
          setUser({ 
            ...MOCK_USERS.customer, 
            email,
            firstName: firstName || 'Customer',
            lastName: lastName || 'User',
            displayName: firstName && lastName ? `${firstName} ${lastName}` : email
          });
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('Signed out');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const success = await authService.resetPassword(email);
      if (success) {
        console.log('Password reset email sent to:', email);
      } else {
        console.error('Password reset failed: User not found');
      }
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    console.log('Initializing authentication...');
    let isMounted = true;
    
    // Add a timeout to prevent infinite loading - reduced to 1.5 seconds
    const timeoutId = setTimeout(() => {
      if (loading && isMounted) {
        console.warn('Authentication initialization timed out, falling back to default user');
        // Force default user if still loading after timeout
        setUser(MOCK_USERS.business);
        localStorage.setItem(USER_ROLE_KEY, 'manager');
        setLoading(false);
      }
    }, 1500); // Reduced timeout to 1.5 seconds for faster loading
    
    const initializeAuth = async () => {
      try {
        // Check if we have a stored user
        const storedUser = getStoredUserData();
        
        if (storedUser && isMounted) {
          console.log('Found stored user data, restoring session');
          setUser(storedUser);
          setLoading(false);
          return;
        }

        // Check if we have a stored role preference
        const storedUserType = localStorage.getItem(USER_ROLE_KEY);
        
        if (storedUserType && isMounted) {
          // Use the stored role preference
          if (storedUserType === 'manager' || storedUserType === 'business') {
            setUser(MOCK_USERS.business);
            console.log('Initialized with stored business user role');
          } else if (storedUserType === 'admin') {
            setUser(MOCK_USERS.admin);
            console.log('Initialized with stored admin user role');
          } else {
            setUser(MOCK_USERS.customer);
            console.log('Initialized with stored customer user role');
          }
          setLoading(false);
          return;
        }

        // Default to business role for testing
        if (isMounted) {
          setUser(MOCK_USERS.business);
          localStorage.setItem(USER_ROLE_KEY, 'manager');
          console.log('No stored data found, defaulting to business user');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error);
        // Fall back to default user in case of any error
        if (isMounted) {
          setUser(MOCK_USERS.business);
          localStorage.setItem(USER_ROLE_KEY, 'manager');
          setLoading(false);
        }
      }
    };
    
    // Immediately start auth initialization
    initializeAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Change user role (for demo/testing)
  const setUserRole = (role: 'admin' | 'manager' | 'staff' | 'customer') => {
    if (role === 'admin') {
      setUser(MOCK_USERS.admin);
    } else if (role === 'customer') {
      setUser(MOCK_USERS.customer);
    } else {
      setUser(MOCK_USERS.business);
    }
    
    localStorage.setItem(USER_ROLE_KEY, role);
    console.log('Role changed to:', role);
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;