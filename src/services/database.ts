import { neon } from '@neondatabase/serverless';
import type { Tables } from '../models/database.types';
import { v4 as uuidv4 } from 'uuid';

// Create a connection to the Neon database using the environment variable
let sql = neon(import.meta.env.VITE_DATABASE_URL || '');
let isConnected = true;
let connectionRetries = 0;
const MAX_RETRIES = 3;

/**
 * Core Database Service
 * Provides functions for interacting with the Neon PostgreSQL database
 */
class DatabaseService {
  /**
   * Try to reconnect to the database in case of connection issues
   */
  async tryReconnect(): Promise<boolean> {
    try {
      if (connectionRetries >= MAX_RETRIES) {
        console.error('Max reconnection attempts reached');
        return false;
      }

      console.log('Attempting to reconnect to the database...');
      connectionRetries++;
      
      // Reinitialize the database connection
      sql = neon(import.meta.env.VITE_DATABASE_URL || '');
      
      // Test the connection with a simple query
      await sql.query('SELECT 1');
      
      console.log('Successfully reconnected to the database');
      isConnected = true;
      connectionRetries = 0;
      return true;
    } catch (error) {
      console.error('Failed to reconnect to the database:', error);
      isConnected = false;
      return false;
    }
  }

  /**
   * Execute a raw SQL query with reconnection logic
   */
  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    try {
      if (!isConnected && !(await this.tryReconnect())) {
        console.error('Database is disconnected and reconnection failed');
        return [];
      }

      const result = await sql.query(query, params);
      connectionRetries = 0; // Reset retries on successful query
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      
      // Try to reconnect if the error might be connection-related
      if (error instanceof Error && 
          (error.message.includes('connection') || 
           error.message.includes('timeout') ||
           error.message.includes('network'))) {
        isConnected = false;
        if (await this.tryReconnect()) {
          // Retry the query after successful reconnection
          return this.executeQuery(query, params);
        }
      }
      
      throw error;
    }
  }

  /**
   * Fetch a single record by ID
   */
  async getById<T extends keyof Tables>(
    table: T, 
    id: string
  ): Promise<Tables[T] | null> {
    try {
      if (!isConnected && !(await this.tryReconnect())) {
        console.error('Database is disconnected and reconnection failed');
        return null;
      }

      const result = await sql`
        SELECT * FROM ${sql(table)} 
        WHERE id = ${id}
        LIMIT 1
      `;
      
      return result.length > 0 ? result[0] as Tables[T] : null;
    } catch (error) {
      console.error(`Error fetching ${table} by ID:`, error);
      
      // Try to reconnect if the error might be connection-related
      if (error instanceof Error && 
          (error.message.includes('connection') || 
           error.message.includes('timeout') ||
           error.message.includes('network'))) {
        isConnected = false;
        if (await this.tryReconnect()) {
          // Retry the operation
          return this.getById(table, id);
        }
      }
      
      throw error;
    }
  }

  /**
   * Fetch records with optional filtering
   */
  async getRecords<T extends keyof Tables>(
    table: T, 
    filters: Partial<Tables[T]> = {}, 
    limit?: number, 
    offset?: number
  ): Promise<Tables[T][]> {
    try {
      // Build WHERE clause from filters
      const whereConditions = Object.entries(filters).map(([key, value]) => {
        return `${key} = ${typeof value === 'string' ? `'${value}'` : value}`;
      });
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      const limitClause = limit ? `LIMIT ${limit}` : '';
      const offsetClause = offset ? `OFFSET ${offset}` : '';
      
      const query = `
        SELECT * FROM ${table}
        ${whereClause}
        ORDER BY created_at DESC
        ${limitClause}
        ${offsetClause}
      `;
      
      const result = await this.executeQuery(query);
      return result as Tables[T][];
    } catch (error) {
      console.error(`Error fetching ${table} records:`, error);
      throw error;
    }
  }

  /**
   * Insert a new record
   */
  async insert<T extends keyof Tables>(
    table: T, 
    data: Omit<Tables[T], 'id' | 'created_at' | 'updated_at'>
  ): Promise<Tables[T]> {
    try {
      // Add ID if not provided
      const dataWithId = {
        id: uuidv4(),
        ...data,
      };
      
      const columns = Object.keys(dataWithId).join(', ');
      const placeholders = Object.keys(dataWithId)
        .map((_, i) => `$${i + 1}`)
        .join(', ');
      
      const values = Object.values(dataWithId);
      
      const query = `
        INSERT INTO ${table} (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await this.executeQuery(query, values);
      return result[0] as Tables[T];
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   */
  async update<T extends keyof Tables>(
    table: T, 
    id: string, 
    data: Partial<Tables[T]>
  ): Promise<Tables[T]> {
    try {
      // Remove id, created_at from update data
      const { id: _, created_at, ...updateData } = data as any;
      
      // Add updated_at
      const dataWithTimestamp = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      
      // Build SET clause
      const setClause = Object.entries(dataWithTimestamp)
        .map(([key, _], i) => `${key} = $${i + 2}`)
        .join(', ');
      
      const values = [id, ...Object.values(dataWithTimestamp)];
      
      const query = `
        UPDATE ${table}
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await this.executeQuery(query, values);
      return result[0] as Tables[T];
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete<T extends keyof Tables>(table: T, id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ${table} WHERE id = $1`;
      await this.executeQuery(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }

  /**
   * Count records with optional filtering
   */
  async countRecords<T extends keyof Tables>(
    table: T, 
    filters: Partial<Tables[T]> = {}
  ): Promise<number> {
    try {
      // Build WHERE clause from filters
      const whereConditions = Object.entries(filters).map(([key, value]) => {
        return `${key} = ${typeof value === 'string' ? `'${value}'` : value}`;
      });
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      const query = `
        SELECT COUNT(*) as count
        FROM ${table}
        ${whereClause}
      `;
      
      const result = await this.executeQuery(query);
      return parseInt(result[0].count);
    } catch (error) {
      console.error(`Error counting ${table} records:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const dbService = new DatabaseService();
export default dbService; 