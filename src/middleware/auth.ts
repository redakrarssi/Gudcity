import { Request, Response, NextFunction } from 'express';
import { getUserIdFromToken, hasRole } from '../utils/auth';
import { sql } from '../services/neonService';

/**
 * Authentication middleware
 * Verifies the JWT token and adds the user to the request object
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Get user from database
    const users = await sql`
      SELECT id, email, first_name, last_name, role, business_id
      FROM users
      WHERE id = ${userId}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Add user to request
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 * @param requiredRole The role required to access the resource
 */
export function authorize(requiredRole: 'admin' | 'manager' | 'staff' | 'customer') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    if (!hasRole(req.user.role, requiredRole)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    
    next();
  };
}

/**
 * Business access middleware
 * Checks if the authenticated user has access to the specified business
 */
export function businessAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const businessId = req.params.businessId || req.query.businessId || req.body.businessId;
    
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    // Admin can access any business
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Other roles can only access their own business
    if (req.user.business_id !== businessId) {
      return res.status(403).json({ success: false, message: 'Access denied to this business' });
    }
    
    next();
  } catch (error) {
    console.error('Business access error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: 'admin' | 'manager' | 'staff' | 'customer';
        business_id: string | null;
      };
    }
  }
} 