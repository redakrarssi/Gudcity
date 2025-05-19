import { sql } from './dbService';
import { getUserByEmail } from './userService';
import { Tables } from '../models/database.types';
import crypto from 'crypto';

// Define User type for export
export type User = {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  businessId?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

// Internal user type from database
type DbUser = Tables['users'];

/**
 * Hash a password using SHA-256
 * @param password The plain text password
 * @returns The hashed password
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Verify a password against a hash
 * @param password The plain text password
 * @param hash The hashed password
 * @returns Whether the password is valid
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
};

/**
 * Authenticate a user with email and password
 * @param email The user's email
 * @param password The user's password
 * @returns The user object without sensitive information if authentication was successful
 */
export const authenticateUser = async (email: string, password: string): Promise<Omit<DbUser, 'password_hash'> | null> => {
  try {
    // Get the user by email
    const user = await getUserByEmail(email);
    
    // If user doesn't exist or password doesn't match, return null
    if (!user || !verifyPassword(password, user.password_hash)) {
      return null;
    }
    
    // Remove sensitive information
    const { password_hash, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param userData The user data
 * @returns The created user without sensitive information
 */
export const registerUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: DbUser['role'];
  business_id?: string | null;
}): Promise<Omit<DbUser, 'password_hash'>> => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const password_hash = hashPassword(userData.password);
    
    // Create the new user
    const result = await sql`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, role, business_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), ${userData.email}, ${password_hash}, ${userData.first_name}, 
        ${userData.last_name}, ${userData.role || 'customer'}, ${userData.business_id || null}, 
        NOW(), NOW()
      ) RETURNING id, email, first_name, last_name, role, business_id, created_at, updated_at
    `;
    
    return result[0] as Omit<DbUser, 'password_hash'>;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Change a user's password
 * @param userId The user ID
 * @param currentPassword The current password
 * @param newPassword The new password
 * @returns Whether the password was changed successfully
 */
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Get the user's current password hash
    const result = await sql`
      SELECT password_hash FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return false;
    }
    
    const currentHash = result[0].password_hash;
    
    // Verify the current password
    if (!verifyPassword(currentPassword, currentHash)) {
      return false;
    }
    
    // Hash and set the new password
    const newHash = hashPassword(newPassword);
    
    await sql`
      UPDATE users
      SET password_hash = ${newHash}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Create a class-based authService compatible with the AuthContext expectations
class AuthService {
  /**
   * Sign in a user with email and password
   */
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      // Use our authenticateUser function
      const dbUser = await authenticateUser(email, password);
      
      if (!dbUser) {
        return null;
      }
      
      // Convert to the format expected by AuthContext
      return {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        businessId: dbUser.business_id || undefined,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        displayName: dbUser.first_name && dbUser.last_name ? 
          `${dbUser.first_name} ${dbUser.last_name}` : dbUser.email
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  /**
   * Register a new user
   */
  async signUp(
    email: string, 
    password: string, 
    role: 'admin' | 'manager' | 'staff' | 'customer',
    firstName?: string,
    lastName?: string,
    businessName?: string,
    phoneNumber?: string,
    address?: string
  ): Promise<User | null> {
    try {
      // Use our registerUser function
      const dbUser = await registerUser({
        email,
        password,
        first_name: firstName || '',
        last_name: lastName || '',
        role,
        // We might need to create a business here if businessName is provided
      });
      
      if (!dbUser) {
        return null;
      }
      
      // Convert to the format expected by AuthContext
      return {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        businessId: dbUser.business_id || undefined,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        displayName: dbUser.first_name && dbUser.last_name ? 
          `${dbUser.first_name} ${dbUser.last_name}` : dbUser.email
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
  
  /**
   * Reset a user's password
   */
  async resetPassword(email: string): Promise<boolean> {
    try {
      // Check if user exists
      const user = await getUserByEmail(email);
      
      if (!user) {
        return false; // User not found
      }
      
      // In a real application, you would:
      // 1. Generate a reset token
      // 2. Store it in the database with expiration
      // 3. Send an email with the reset link
      
      console.log(`Password reset requested for ${email}`);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
  
  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      // Get user from database
      const result = await sql`
        SELECT * FROM users
        WHERE id = ${userId}
        LIMIT 1
      `;
      
      if (result.length === 0) {
        return null;
      }
      
      const dbUser = result[0];
      
      // Convert to the format expected by AuthContext
      return {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        businessId: dbUser.business_id || undefined,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        displayName: dbUser.first_name && dbUser.last_name ? 
          `${dbUser.first_name} ${dbUser.last_name}` : dbUser.email
      };
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

// Export both the default instance and individual functions
export default authService; 