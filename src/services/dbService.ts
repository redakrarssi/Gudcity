import { neon } from '@neondatabase/serverless';
import { Tables } from '../models/database.types';

// Create a connection to the Neon database
const connectionString = import.meta.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Log connection status (without exposing sensitive data)
console.log('Database URL exists:', !!import.meta.env.VITE_DATABASE_URL);

// Initialize SQL client
const sql = neon(connectionString);

export { sql };

/**
 * Generic function to find a record by ID
 * @param table The table name to query
 * @param id The ID to search for
 * @returns The found record or null
 */
export const findById = async <T extends keyof Tables>(table: T, id: string): Promise<Tables[T] | null> => {
  try {
    // Using the sql` ` tagged template literal syntax
    const result = await sql`SELECT * FROM ${table} WHERE id = ${id}`;
    return result[0] as Tables[T] || null;
  } catch (error) {
    console.error(`Error finding ${String(table)} by ID:`, error);
    throw error;
  }
};

/**
 * Generic function to create a new record
 * @param table The table name to insert into
 * @param data The data to insert
 * @returns The created record
 */
export const create = async <T extends keyof Tables>(table: T, data: Partial<Tables[T]>): Promise<Tables[T]> => {
  try {
    // For tables that have created_at/updated_at
    if ('created_at' in data === false && table !== 'comments') {
      // @ts-ignore - TypeScript doesn't know we're adding timestamp fields
      data.created_at = new Date().toISOString();
      // @ts-ignore
      data.updated_at = new Date().toISOString();
    }
    
    // Create dynamic columns and values for SQL
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    // Build dynamic INSERT query
    // We can't use direct string interpolation for table/column names
    // Use a more complex approach for dynamic queries
    const columnsList = columns.join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    // For dynamic tables and columns, we need a different approach
    // This is a workaround for dynamic table/column names
    const query = `INSERT INTO "${table}" (${columnsList}) VALUES (${placeholders}) RETURNING *`;
    
    // Use the raw query functionality
    const result = await sql.query(query, values);
    
    // Neon returns results in the rows property when using raw queries
    return (result.rows ? result.rows[0] : result[0]) as Tables[T];
  } catch (error) {
    console.error(`Error creating record in ${String(table)}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a record
 * @param table The table name to update
 * @param id The ID of the record to update
 * @param data The data to update
 * @returns The updated record
 */
export const update = async <T extends keyof Tables>(table: T, id: string, data: Partial<Tables[T]>): Promise<Tables[T]> => {
  try {
    // Add updated_at if table supports it
    if ('updated_at' in data === false && table !== 'comments') {
      // @ts-ignore
      data.updated_at = new Date().toISOString();
    }
    
    // Create dynamic SET clause
    const columns = Object.keys(data);
    const values = [...Object.values(data), id]; // Add ID as the last parameter
    
    // Build SET clause with placeholders
    const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');
    
    // Build the query with the last parameter being the ID
    const query = `UPDATE "${table}" SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    
    // Execute the query
    const result = await sql.query(query, values);
    
    // Return the updated record
    return (result.rows ? result.rows[0] : result[0]) as Tables[T];
  } catch (error) {
    console.error(`Error updating record in ${String(table)}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a record
 * @param table The table name to delete from
 * @param id The ID of the record to delete
 * @returns The deleted record or null
 */
export const remove = async <T extends keyof Tables>(table: T, id: string): Promise<Tables[T] | null> => {
  try {
    // Using the sql` ` tagged template literal syntax
    const result = await sql`DELETE FROM ${table} WHERE id = ${id} RETURNING *`;
    return result[0] as Tables[T] || null;
  } catch (error) {
    console.error(`Error deleting from ${String(table)}:`, error);
    throw error;
  }
};

/**
 * Generic function to find all records
 * @param table The table name to query
 * @param condition Object of field-value pairs for WHERE clause
 * @param limit Maximum number of records to return
 * @param offset Number of records to skip
 * @returns Array of found records
 */
export const findAll = async <T extends keyof Tables>(
  table: T, 
  condition: Partial<Record<keyof Tables[T], any>> = {}, 
  limit = 100, 
  offset = 0
): Promise<Tables[T][]> => {
  try {
    const whereConditions = Object.keys(condition);
    
    if (whereConditions.length === 0) {
      // No conditions, perform simple query with limit/offset
      const result = await sql`
        SELECT * FROM ${table} 
        LIMIT ${limit} OFFSET ${offset}
      `;
      return result as Tables[T][];
    } else {
      // For complex dynamic WHERE clauses, we use a different approach
      const whereClauses = whereConditions.map((key, i) => `"${key}" = $${i + 1}`).join(' AND ');
      const values = [...Object.values(condition), limit, offset];
      
      const query = `
        SELECT * FROM "${table}" 
        WHERE ${whereClauses} 
        LIMIT $${values.length - 1} OFFSET $${values.length}
      `;
      
      const result = await sql.query(query, values);
      return (result.rows || result) as Tables[T][];
    }
  } catch (error) {
    console.error(`Error finding records in ${String(table)}:`, error);
    throw error;
  }
};

/**
 * Execute a custom SQL query with parameters
 * @param queryText The SQL query string 
 * @param params The parameters for the query
 * @returns The query result
 */
export const executeQuery = async <T = any>(queryText: string, params: any[] = []): Promise<T[]> => {
  try {
    const result = await sql.query(queryText, params);
    return (result.rows || result) as T[];
  } catch (error) {
    console.error('Error executing custom query:', error);
    throw error;
  }
}; 