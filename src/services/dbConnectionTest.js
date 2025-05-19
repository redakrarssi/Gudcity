/**
 * Database Connection Test Service for Website
 * 
 * This service tests if the website can properly connect to and interact with the database.
 * It provides functions for:
 * 1. Testing database connectivity
 * 2. Testing read/write operations
 * 3. Checking database status
 */

import { neon } from '@neondatabase/serverless';

// Use the connection string from environment or fallback to hardcoded one
const connectionString = import.meta.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Create the SQL connection
const sql = neon(connectionString);

/**
 * Tests basic connectivity to the database
 * @returns {Promise<{success: boolean, message: string, latencyMs: number}>}
 */
export async function testDatabaseConnection() {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    await sql`SELECT 1 as connection_test`;
    
    const latencyMs = Date.now() - startTime;
    
    return {
      success: true,
      message: 'Successfully connected to database',
      latencyMs
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return {
      success: false,
      message: `Failed to connect to database: ${error.message}`,
      latencyMs: Date.now() - startTime,
      error
    };
  }
}

/**
 * Tests if the website can write to the database
 * @returns {Promise<{success: boolean, message: string, commentId: number|null}>}
 */
export async function testDatabaseWrite() {
  try {
    // Try to write a test comment to the database
    const testComment = `Website connection test at ${new Date().toISOString()}`;
    
    const result = await sql`
      INSERT INTO comments (comment) 
      VALUES (${testComment}) 
      RETURNING *
    `;
    
    if (result && result.length > 0) {
      return {
        success: true,
        message: 'Successfully wrote to database',
        comment: result[0].comment,
        commentId: result[0].id
      };
    } else {
      return {
        success: false,
        message: 'Failed to write to database: No result returned',
        commentId: null
      };
    }
  } catch (error) {
    console.error('Database write test failed:', error);
    
    return {
      success: false,
      message: `Failed to write to database: ${error.message}`,
      commentId: null,
      error
    };
  }
}

/**
 * Tests if the website can read from the database
 * @returns {Promise<{success: boolean, message: string, tableCount: number, tables: string[]}>}
 */
export async function testDatabaseRead() {
  try {
    // Try to read the list of tables from the database
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables && tables.length > 0) {
      return {
        success: true,
        message: 'Successfully read from database',
        tableCount: tables.length,
        tables: tables.map(t => t.table_name)
      };
    } else {
      return {
        success: false,
        message: 'Failed to read from database: No tables found',
        tableCount: 0,
        tables: []
      };
    }
  } catch (error) {
    console.error('Database read test failed:', error);
    
    return {
      success: false,
      message: `Failed to read from database: ${error.message}`,
      tableCount: 0,
      tables: [],
      error
    };
  }
}

/**
 * Checks if all required tables exist in the database
 * @returns {Promise<{success: boolean, message: string, missingTables: string[]}>}
 */
export async function checkRequiredTables() {
  try {
    // Get all tables in the database
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    
    // List of required tables
    const requiredTables = [
      'users',
      'businesses',
      'customers',
      'loyalty_programs',
      'loyalty_cards',
      'transactions',
      'rewards',
      'settings',
      'redemption_codes',
      'qr_codes',
      'comments'
    ];
    
    // Check for missing tables
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length === 0) {
      return {
        success: true,
        message: 'All required tables exist in the database',
        missingTables: []
      };
    } else {
      return {
        success: false,
        message: `Missing required tables: ${missingTables.join(', ')}`,
        missingTables
      };
    }
  } catch (error) {
    console.error('Table check failed:', error);
    
    return {
      success: false,
      message: `Failed to check tables: ${error.message}`,
      missingTables: [],
      error
    };
  }
}

/**
 * Run all database connection tests
 * @returns {Promise<{overall: boolean, connection: object, read: object, write: object, tables: object}>}
 */
export async function runAllConnectionTests() {
  const connectionTest = await testDatabaseConnection();
  const readTest = await testDatabaseRead();
  const writeTest = await testDatabaseWrite();
  const tableCheck = await checkRequiredTables();
  
  // Overall status is successful if all individual tests pass
  const overallSuccess = 
    connectionTest.success && 
    readTest.success && 
    writeTest.success && 
    tableCheck.success;
  
  return {
    overall: overallSuccess,
    connection: connectionTest,
    read: readTest,
    write: writeTest,
    tables: tableCheck
  };
}

// Default export for direct import
export default {
  testConnection: testDatabaseConnection,
  testRead: testDatabaseRead,
  testWrite: testDatabaseWrite,
  checkTables: checkRequiredTables,
  runAllTests: runAllConnectionTests
}; 