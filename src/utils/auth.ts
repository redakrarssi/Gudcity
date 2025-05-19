/**
 * Authentication utility functions
 * 
 * These are helper functions for authentication related operations.
 */

import { createHash } from 'crypto';

/**
 * Hash a password using SHA-256
 * In a production app, you should use bcrypt or Argon2 instead
 * 
 * @param password Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Verify a password against a hash
 * 
 * @param password Plain text password
 * @param hash Hashed password
 * @returns Whether the password matches the hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Generate a simple token
 * In a production app, you would use JWT with proper secret keys
 * 
 * @param userId User ID
 * @returns A token
 */
export function generateToken(userId: string): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return `${userId}-${timestamp}-${randomString}`;
}

/**
 * Verify a token format (basic validation only)
 * 
 * @param token Token to verify
 * @returns Whether the token is valid
 */
export function verifyToken(token: string): boolean {
  // Simple check for token format (userId-timestamp-randomString)
  const parts = token.split('-');
  return parts.length === 3 && parts[0].length > 0;
}

/**
 * Extract user ID from a token
 * 
 * @param token Token to extract from
 * @returns User ID or null if invalid
 */
export function getUserIdFromToken(token: string): string | null {
  if (!verifyToken(token)) {
    return null;
  }
  
  return token.split('-')[0];
}

/**
 * Check if a user has a specific role
 * 
 * @param userRole User's role
 * @param requiredRole Required role
 * @returns Whether the user has the required role
 */
export function hasRole(
  userRole: 'admin' | 'manager' | 'staff' | 'customer',
  requiredRole: 'admin' | 'manager' | 'staff' | 'customer'
): boolean {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }
  
  // Manager can access manager, staff, and customer resources
  if (userRole === 'manager' && requiredRole !== 'admin') {
    return true;
  }
  
  // Staff can access staff and customer resources
  if (userRole === 'staff' && (requiredRole === 'staff' || requiredRole === 'customer')) {
    return true;
  }
  
  // Customer can only access customer resources
  if (userRole === 'customer' && requiredRole === 'customer') {
    return true;
  }
  
  return false;
}

/**
 * Generate a random secure token (for password reset, etc.)
 * 
 * @param length - The length of the token to generate
 * @returns A random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}

/**
 * Check if a token is expired
 * 
 * @param tokenExpiry - The expiry date of the token
 * @returns True if the token is expired, false otherwise
 */
export function isTokenExpired(tokenExpiry: string | Date): boolean {
  const expiryDate = typeof tokenExpiry === 'string' ? new Date(tokenExpiry) : tokenExpiry;
  const now = new Date();
  return expiryDate < now;
} 