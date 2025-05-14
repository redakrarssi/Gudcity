/**
 * Authentication utility functions
 * 
 * These are helper functions for authentication related operations.
 */

/**
 * Hash a password (simple implementation for demo purposes)
 * In a production environment, use a proper password hashing algorithm like bcrypt
 * 
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export function hashPassword(password: string): string {
  // Simple hash function for demo - NOT SECURE for production
  return `hashed_${password}`;
}

/**
 * Verify if a plain text password matches a hashed password
 * 
 * @param plainPassword - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return hashedPassword === `hashed_${plainPassword}`;
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

/**
 * Check if a user has the required role
 * 
 * @param userRole - The user's role
 * @param requiredRole - The required role to check
 * @returns True if the user has the required role, false otherwise
 */
export function hasRole(
  userRole: 'admin' | 'manager' | 'staff' | 'customer',
  requiredRole: 'admin' | 'manager' | 'staff' | 'customer'
): boolean {
  const roleRank = {
    admin: 4,
    manager: 3,
    staff: 2,
    customer: 1
  };
  
  return roleRank[userRole] >= roleRank[requiredRole];
} 