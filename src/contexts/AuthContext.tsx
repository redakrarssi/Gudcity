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

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USER_STORAGE_KEY = 'gudcity_user';
const USER_ROLE_KEY = 'gudcity_role_preference';

// Helper function to get stored user data
function getStoredUserData(): User | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error reading user data from localStorage:', error);
    return null;
  }
}

// Helper function to get role preference
function getRolePreference(): 'admin' | 'manager' | 'staff' | 'customer' {
  try {
    const role = localStorage.getItem(USER_ROLE_KEY);
    if (role === 'admin' || role === 'manager' || role === 'staff' || role === 'customer') {
      return role;
    }
    return 'customer'; // Default to customer
  } catch (error) {
    console.error('Error reading role preference from localStorage:', error);
    return 'customer';
  }
}

// Context hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
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
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
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
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Allow setting user role preference
  const setUserRole = (role: 'admin' | 'manager' | 'staff' | 'customer') => {
    if (user) {
      setUser({ ...user, role });
    } else {
      localStorage.setItem(USER_ROLE_KEY, role);
    }
  };

  // Initial loading effect
  useEffect(() => {
    // Check if we have a user in storage
    const storedUser = getStoredUserData();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;