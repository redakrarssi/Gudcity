import { neon } from '@neondatabase/serverless';
import { Tables } from '../models/database.types';

// Connect to the database using environment variable
const connectionString = import.meta.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Create a database connection
export const sql = neon(connectionString);

/**
 * Generic function to find a record by ID
 * @param table Table name
 * @param id ID of the record
 * @returns The record or null
 */
export async function findById<T extends keyof Tables>(
  table: T, 
  id: string
): Promise<Tables[T] | null> {
  try {
    const result = await sql`
      SELECT * FROM ${table}
      WHERE id = ${id}
      LIMIT 1
    `;
    return result[0] as Tables[T] || null;
  } catch (error) {
    console.error(`Error finding ${table} by ID:`, error);
    throw error;
  }
}

/**
 * Generic function to find all records from a table
 * @param table Table name
 * @param options Query options
 * @returns Array of records
 */
export async function findAll<T extends keyof Tables>(
  table: T,
  options: {
    where?: Record<string, any>;
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<Tables[T][]> {
  try {
    const { where = {}, limit = 100, offset = 0, orderBy = 'created_at', orderDirection = 'desc' } = options;
    
    // Build WHERE clause
    const whereEntries = Object.entries(where);
    let whereClause = '';
    const queryParams: any[] = [];
    
    if (whereEntries.length > 0) {
      whereClause = 'WHERE ' + whereEntries
        .map((entry, i) => {
          queryParams.push(entry[1]);
          return `${entry[0]} = $${i + 1}`;
        })
        .join(' AND ');
    }

    // Execute the query using the raw query approach
    const queryText = `
      SELECT * FROM "${String(table)}"
      ${whereClause}
      ORDER BY ${orderBy} ${orderDirection === 'asc' ? 'ASC' : 'DESC'}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const result = await sql.query(queryText, queryParams);
    return result as unknown as Tables[T][];
  } catch (error) {
    console.error(`Error finding all ${table}:`, error);
    throw error;
  }
}

/**
 * Generic function to create a record
 * @param table Table name
 * @param data Record data
 * @returns Created record
 */
export async function create<T extends keyof Tables>(
  table: T,
  data: Partial<Tables[T]>
): Promise<Tables[T]> {
  try {
    const columns = Object.keys(data);
    const dataValues = Object.values(data);
    
    if (columns.length === 0) {
      throw new Error('No data provided for creation');
    }

    const placeholders = dataValues.map((_, i) => `$${i + 1}`);
    
    // Generate query
    const queryText = `
      INSERT INTO "${String(table)}" (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await sql.query(queryText, dataValues);
    const firstRow = Array.isArray(result) ? result[0] : result;
    return firstRow as Tables[T];
  } catch (error) {
    console.error(`Error creating ${table}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a record
 * @param table Table name
 * @param id Record ID
 * @param data Update data
 * @returns Updated record
 */
export async function update<T extends keyof Tables>(
  table: T,
  id: string,
  data: Partial<Tables[T]>
): Promise<Tables[T]> {
  try {
    const entries = Object.entries(data);
    
    if (entries.length === 0) {
      throw new Error('No data provided for update');
    }
    
    const setClause = entries
      .map((entry, i) => `${entry[0]} = $${i + 2}`)
      .join(', ');
    
    const queryParams = [id, ...entries.map(entry => entry[1])];
    
    // Generate query
    const queryText = `
      UPDATE "${String(table)}"
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await sql.query(queryText, queryParams);
    const firstRow = Array.isArray(result) ? result[0] : result;
    return firstRow as Tables[T];
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
}

/**
 * Generic function to remove a record
 * @param table Table name
 * @param id Record ID
 * @returns Boolean indicating success
 */
export async function remove<T extends keyof Tables>(
  table: T,
  id: string
): Promise<boolean> {
  try {
    const queryText = `
      DELETE FROM "${String(table)}"
      WHERE id = $1
    `;
    
    await sql.query(queryText, [id]);
    return true;
  } catch (error) {
    console.error(`Error removing ${table}:`, error);
    throw error;
  }
}

/**
 * Execute a raw SQL query
 * @param query SQL query
 * @param params Query parameters
 * @returns Query result
 */
export async function executeQuery<T>(
  queryText: string,
  queryParams: any[] = []
): Promise<T[]> {
  try {
    const result = await sql.query(queryText, queryParams);
    return result as unknown as T[];
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

/**
 * Begin a transaction
 */
export async function beginTransaction() {
  return await sql`BEGIN`;
}

/**
 * Commit a transaction
 */
export async function commitTransaction() {
  return await sql`COMMIT`;
}

/**
 * Rollback a transaction
 */
export async function rollbackTransaction() {
  return await sql`ROLLBACK`;
} 