import { sql, findById, create, update, remove, findAll } from './dbService';
import { Tables } from '../models/database.types';

type User = Tables['users'];

/**
 * Get a user by ID
 * @param id The user ID
 * @returns The user or null if not found
 */
export const getUserById = async (id: string): Promise<User | null> => {
  return await findById('users', id);
};

/**
 * Get a user by email
 * @param email The user's email
 * @returns The user or null if not found
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await sql`
      SELECT * FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    return result[0] as User || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param userData The user data
 * @returns The created user
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  return await create('users', userData);
};

/**
 * Update a user
 * @param id The user ID
 * @param userData The updated user data
 * @returns The updated user
 */
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  return await update('users', id, userData);
};

/**
 * Delete a user
 * @param id The user ID
 * @returns The deleted user or null
 */
export const deleteUser = async (id: string): Promise<User | null> => {
  return await remove('users', id);
};

/**
 * Get all users
 * @param limit Maximum number of users to return
 * @param offset Number of users to skip
 * @returns Array of users
 */
export const getAllUsers = async (limit = 100, offset = 0): Promise<User[]> => {
  return await findAll('users', {}, limit, offset);
};

/**
 * Get users by role
 * @param role The role to filter by
 * @param limit Maximum number of users to return
 * @param offset Number of users to skip
 * @returns Array of users with the specified role
 */
export const getUsersByRole = async (role: User['role'], limit = 100, offset = 0): Promise<User[]> => {
  return await findAll('users', { role }, limit, offset);
};

/**
 * Get staff members for a specific business
 * @param businessId The business ID
 * @returns Array of users who are staff or managers for the business
 */
export const getBusinessStaff = async (businessId: string): Promise<User[]> => {
  try {
    const result = await sql`
      SELECT * FROM users
      WHERE business_id = ${businessId}
      AND role IN ('manager', 'staff')
      ORDER BY role, last_name, first_name
    `;
    return result as User[];
  } catch (error) {
    console.error('Error getting business staff:', error);
    throw error;
  }
}; 