import { Request, Response } from 'express';
import { hashPassword } from '../src/utils/auth';
import { sql } from '../src/services/neonService';
import { nanoid } from 'nanoid';

/**
 * Register a new user
 * POST /api/users/register
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, role = 'customer', businessId = null } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = hashPassword(password);
    const userId = nanoid();
    const now = new Date().toISOString();
    
    // Create user record
    await sql`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, 
        role, business_id, created_at, updated_at
      ) VALUES (
        ${userId}, ${email}, ${passwordHash}, ${firstName || null}, 
        ${lastName || null}, ${role}, ${businessId}, ${now}, ${now}
      )
    `;
    
    // If role is customer, create a customer profile
    if (role === 'customer') {
      await sql`
        INSERT INTO customers (
          id, user_id, first_name, last_name, email, sign_up_date,
          total_points, created_at, updated_at
        ) VALUES (
          ${nanoid()}, ${userId}, ${firstName || null}, ${lastName || null},
          ${email}, ${now}, 0, ${now}, ${now}
        )
      `;
    }
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
}

/**
 * Login a user
 * POST /api/users/login
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Retrieve user from database
    const users = await sql`
      SELECT id, email, password_hash, first_name, last_name, role, business_id
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password (normally would use bcrypt.compare here)
    if (user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Return user data (excluding password)
    const { password_hash, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: `jwt-token-${user.id}` // In a real app, generate a JWT token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
}

/**
 * Get user profile
 * GET /api/users/:id
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Get user data
    const users = await sql`
      SELECT id, email, first_name, last_name, role, business_id, created_at
      FROM users 
      WHERE id = ${id}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // If customer, get additional info
    const user = users[0];
    if (user.role === 'customer') {
      const customers = await sql`
        SELECT * FROM customers WHERE user_id = ${id}
      `;
      
      if (customers.length > 0) {
        user.customer_profile = customers[0];
      }
    }
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update user profile
 * PUT /api/users/:id
 */
export async function updateUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;
    
    // Update user record
    await sql`
      UPDATE users 
      SET 
        first_name = ${firstName || null},
        last_name = ${lastName || null},
        email = COALESCE(${email}, email),
        updated_at = ${new Date().toISOString()}
      WHERE id = ${id}
    `;
    
    // If email updated, also update customer profile if exists
    if (email) {
      await sql`
        UPDATE customers
        SET email = ${email}, updated_at = ${new Date().toISOString()}
        WHERE user_id = ${id}
      `;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default {
  register,
  login,
  getUserProfile,
  updateUserProfile
}; 