import { neon } from '@neondatabase/serverless';
import dbService from './database';
import { v4 as uuidv4 } from 'uuid';

// For password hashing - we'll use a simple hash for demo purposes
// In production, you would use bcrypt or similar
function hashPassword(password: string): string {
  // Simple hash function for demo - NOT SECURE for production
  return `hashed_${password}`;
}

// For password verification - simple comparison for demo
function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return hashedPassword === `hashed_${plainPassword}`;
}

// User type definition
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  businessId?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

/**
 * Authentication Service
 * Handles user authentication against the database
 */
class AuthService {
  /**
   * Sign in a user with email and password
   */
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      // Find user by email
      const users = await dbService.executeQuery(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      if (users.length === 0) {
        return null; // User not found
      }
      
      const user = users[0];
      
      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        return null; // Password incorrect
      }
      
      // Find associated business or customer records
      let businessId = user.business_id;
      let customerId = null;
      
      if (user.role === 'customer') {
        const customers = await dbService.executeQuery(
          'SELECT * FROM customers WHERE user_id = $1 LIMIT 1',
          [user.id]
        );
        
        if (customers.length > 0) {
          customerId = customers[0].id;
          // If customer is associated with a business, get that too
          businessId = customers[0].business_id;
        }
      }
      
      // Format user object
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: businessId || undefined,
        customerId: customerId || undefined,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.first_name && user.last_name ? 
          `${user.first_name} ${user.last_name}` : user.email
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
      // Check if email already exists
      const existingUsers = await dbService.executeQuery(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('Email already in use');
      }
      
      // Create transaction for related operations
      const userId = uuidv4();
      const now = new Date().toISOString();
      
      // Create user
      await dbService.executeQuery(
        `INSERT INTO users (
          id, email, password_hash, first_name, last_name, role, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          email,
          hashPassword(password),
          firstName || null,
          lastName || null,
          role,
          now,
          now
        ]
      );
      
      let businessId = undefined;
      let customerId = undefined;
      
      // If business admin or manager role, create business record
      if ((role === 'manager' || role === 'admin') && businessName) {
        const business = await dbService.executeQuery(
          `INSERT INTO businesses (
            id, name, owner_id, email, phone, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id`,
          [
            uuidv4(),
            businessName,
            userId,
            email,
            phoneNumber || null,
            now,
            now
          ]
        );
        
        if (business.length > 0) {
          businessId = business[0].id;
          
          // Update user with business ID
          await dbService.executeQuery(
            'UPDATE users SET business_id = $1 WHERE id = $2',
            [businessId, userId]
          );
        }
      }
      
      // If customer role, create customer record
      if (role === 'customer') {
        const customer = await dbService.executeQuery(
          `INSERT INTO customers (
            id, user_id, first_name, last_name, email, phone, address, sign_up_date, 
            total_points, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            uuidv4(),
            userId,
            firstName || null,
            lastName || null,
            email,
            phoneNumber || null,
            address || null,
            now,
            0, // Initial points
            now,
            now
          ]
        );
        
        if (customer.length > 0) {
          customerId = customer[0].id;
        }
      }
      
      // Return user object
      return {
        id: userId,
        email,
        role,
        businessId,
        customerId,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        displayName: firstName && lastName ? 
          `${firstName} ${lastName}` : email
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
      const users = await dbService.executeQuery(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      if (users.length === 0) {
        return false; // User not found
      }
      
      // In a real application, you would:
      // 1. Generate a reset token
      // 2. Store it in the database with expiration
      // 3. Send an email with the reset link
      
      // For this demo, we'll just log that the reset was requested
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
      const users = await dbService.executeQuery(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [userId]
      );
      
      if (users.length === 0) {
        return null; // User not found
      }
      
      const user = users[0];
      
      // Find associated business or customer records
      let businessId = user.business_id;
      let customerId = null;
      
      if (user.role === 'customer') {
        const customers = await dbService.executeQuery(
          'SELECT * FROM customers WHERE user_id = $1 LIMIT 1',
          [user.id]
        );
        
        if (customers.length > 0) {
          customerId = customers[0].id;
          // If customer is associated with a business, get that too
          businessId = customers[0].business_id;
        }
      }
      
      // Format user object
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: businessId || undefined,
        customerId: customerId || undefined,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.first_name && user.last_name ? 
          `${user.first_name} ${user.last_name}` : user.email
      };
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService; 