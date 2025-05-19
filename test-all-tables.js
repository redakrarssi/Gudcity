/**
 * Comprehensive Database Table Testing Script
 * 
 * This script tests all tables in the Neon PostgreSQL database by:
 * 1. Testing connection to the database
 * 2. Creating test records in each table
 * 3. Reading records from each table
 * 4. Updating records in each table
 * 5. Deleting test records
 * 
 * Run with: node test-all-tables.js
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

// Use the connection string from environment or fallback to hardcoded one
const connectionString = process.env.VITE_DATABASE_URL || 
  'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// Create the SQL connection
const sql = neon(connectionString);

// Test IDs to track and clean up test data
const TEST_IDS = {
  userId: null,
  businessId: null,
  customerId: null,
  programId: null,
  rewardId: null,
  cardId: null,
  transactionId: null,
  settingsId: null,
  redemptionCodeId: null,
  qrCodeId: null,
};

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

async function testAllTables() {
  try {
    console.log(`${colors.bright}${colors.blue}🔍 STARTING COMPREHENSIVE DATABASE TESTS${colors.reset}\n`);
    
    // Get all tables in the public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log(`${colors.cyan}📋 Tables in database:${colors.reset}`);
    tables.forEach(table => console.log(` - ${table.table_name}`));
    console.log(`\nTotal tables found: ${tables.length}\n`);
    
    // Run all tests in sequence
    try {
      await testUsersTable();
      await testBusinessesTable();
      await testCustomersTable();
      await testLoyaltyProgramsTable();
      await testRewardsTable();
      await testLoyaltyCardsTable();
      await testTransactionsTable();
      await testSettingsTable();
      await testRedemptionCodesTable();
      await testQrCodesTable();
      await testCommentsTable();
      
      // Clean up test data
      console.log(`\n${colors.bright}${colors.yellow}🧹 Cleaning up test data...${colors.reset}`);
      await cleanupTestData();
      
      console.log(`\n${colors.bright}${colors.green}✅ ALL DATABASE TESTS COMPLETED SUCCESSFULLY!${colors.reset}`);
    } catch (error) {
      console.error(`\n${colors.bright}${colors.red}❌ TEST FAILED: ${error.message}${colors.reset}`);
      console.error(error);
      
      // Try to clean up even if tests failed
      try {
        await cleanupTestData();
      } catch (cleanupError) {
        console.error(`${colors.red}⚠️ Error during cleanup: ${cleanupError.message}${colors.reset}`);
      }
    }
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}❌ ERROR CONNECTING TO DATABASE: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Test the Users table
async function testUsersTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING USERS TABLE${colors.reset}`);
  
  try {
    // Create test user
    const email = `test_user_${randomUUID()}@example.com`;
    const passwordHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // Hash for 'password'
    
    const createResult = await sql`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, role, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${email}, ${passwordHash}, ${'Test'}, ${'User'}, ${'customer'}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.userId = createResult[0].id;
    console.log(`${colors.green}✅ Created test user with id: ${TEST_IDS.userId}${colors.reset}`);
    
    // Read user
    const readResult = await sql`SELECT * FROM users WHERE id = ${TEST_IDS.userId}`;
    console.log(`${colors.green}✅ Retrieved user:${colors.reset} ${readResult[0].email}`);
    
    // Update user
    await sql`
      UPDATE users 
      SET first_name = ${'Updated'}, last_name = ${'Name'} 
      WHERE id = ${TEST_IDS.userId}
    `;
    
    const updatedResult = await sql`SELECT * FROM users WHERE id = ${TEST_IDS.userId}`;
    console.log(`${colors.green}✅ Updated user name:${colors.reset} ${updatedResult[0].first_name} ${updatedResult[0].last_name}`);
    
    console.log(`${colors.green}✅ Users table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Users table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Businesses table
async function testBusinessesTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING BUSINESSES TABLE${colors.reset}`);
  
  try {
    // Create test business
    const createResult = await sql`
      INSERT INTO businesses (
        id, name, owner_id, address, phone, email, website, description, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${'Test Business'}, ${TEST_IDS.userId}, ${'123 Test St'}, ${'555-1234'}, 
        ${'business@example.com'}, ${'https://example.com'}, ${'A test business'}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.businessId = createResult[0].id;
    console.log(`${colors.green}✅ Created test business with id: ${TEST_IDS.businessId}${colors.reset}`);
    
    // Read business
    const readResult = await sql`SELECT * FROM businesses WHERE id = ${TEST_IDS.businessId}`;
    console.log(`${colors.green}✅ Retrieved business:${colors.reset} ${readResult[0].name}`);
    
    // Update business
    await sql`
      UPDATE businesses 
      SET name = ${'Updated Business Name'} 
      WHERE id = ${TEST_IDS.businessId}
    `;
    
    const updatedResult = await sql`SELECT * FROM businesses WHERE id = ${TEST_IDS.businessId}`;
    console.log(`${colors.green}✅ Updated business name:${colors.reset} ${updatedResult[0].name}`);
    
    // Update user with business ID
    await sql`
      UPDATE users 
      SET business_id = ${TEST_IDS.businessId} 
      WHERE id = ${TEST_IDS.userId}
    `;
    console.log(`${colors.green}✅ Associated user with business${colors.reset}`);
    
    console.log(`${colors.green}✅ Businesses table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Businesses table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Customers table
async function testCustomersTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING CUSTOMERS TABLE${colors.reset}`);
  
  try {
    // Create test customer
    const createResult = await sql`
      INSERT INTO customers (
        id, user_id, business_id, first_name, last_name, email, phone, address, 
        sign_up_date, total_points, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.userId}, ${TEST_IDS.businessId}, ${'Test'}, ${'Customer'}, 
        ${'customer@example.com'}, ${'555-5678'}, ${'456 Customer Ave'}, 
        NOW(), ${0}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.customerId = createResult[0].id;
    console.log(`${colors.green}✅ Created test customer with id: ${TEST_IDS.customerId}${colors.reset}`);
    
    // Read customer
    const readResult = await sql`SELECT * FROM customers WHERE id = ${TEST_IDS.customerId}`;
    console.log(`${colors.green}✅ Retrieved customer:${colors.reset} ${readResult[0].first_name} ${readResult[0].last_name}`);
    
    // Update customer
    await sql`
      UPDATE customers 
      SET total_points = ${100} 
      WHERE id = ${TEST_IDS.customerId}
    `;
    
    const updatedResult = await sql`SELECT * FROM customers WHERE id = ${TEST_IDS.customerId}`;
    console.log(`${colors.green}✅ Updated customer points:${colors.reset} ${updatedResult[0].total_points}`);
    
    console.log(`${colors.green}✅ Customers table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Customers table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Loyalty Programs table
async function testLoyaltyProgramsTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING LOYALTY PROGRAMS TABLE${colors.reset}`);
  
  try {
    // Create test loyalty program
    const rulesJson = JSON.stringify({
      pointsPerDollar: 10,
      tiers: [
        { name: 'Bronze', threshold: 0, benefits: ['5% discount'] },
        { name: 'Silver', threshold: 1000, benefits: ['10% discount'] },
        { name: 'Gold', threshold: 5000, benefits: ['15% discount', 'Free shipping'] }
      ]
    });
    
    const createResult = await sql`
      INSERT INTO loyalty_programs (
        id, business_id, name, type, description, rules, active, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${'Test Rewards Program'}, ${'tiered'}, 
        ${'A test loyalty program'}, ${rulesJson}::jsonb, ${true}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.programId = createResult[0].id;
    console.log(`${colors.green}✅ Created test loyalty program with id: ${TEST_IDS.programId}${colors.reset}`);
    
    // Read program
    const readResult = await sql`SELECT * FROM loyalty_programs WHERE id = ${TEST_IDS.programId}`;
    console.log(`${colors.green}✅ Retrieved loyalty program:${colors.reset} ${readResult[0].name}`);
    
    // Update program
    await sql`
      UPDATE loyalty_programs 
      SET name = ${'Updated Rewards Program'} 
      WHERE id = ${TEST_IDS.programId}
    `;
    
    const updatedResult = await sql`SELECT * FROM loyalty_programs WHERE id = ${TEST_IDS.programId}`;
    console.log(`${colors.green}✅ Updated program name:${colors.reset} ${updatedResult[0].name}`);
    
    console.log(`${colors.green}✅ Loyalty Programs table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Loyalty Programs table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Rewards table
async function testRewardsTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING REWARDS TABLE${colors.reset}`);
  
  try {
    // Create test reward
    const createResult = await sql`
      INSERT INTO rewards (
        id, business_id, program_id, name, description, points_required, active, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${TEST_IDS.programId}, ${'Free Coffee'}, 
        ${'A free coffee after earning enough points'}, ${100}, ${true}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.rewardId = createResult[0].id;
    console.log(`${colors.green}✅ Created test reward with id: ${TEST_IDS.rewardId}${colors.reset}`);
    
    // Read reward
    const readResult = await sql`SELECT * FROM rewards WHERE id = ${TEST_IDS.rewardId}`;
    console.log(`${colors.green}✅ Retrieved reward:${colors.reset} ${readResult[0].name}`);
    
    // Update reward
    await sql`
      UPDATE rewards 
      SET points_required = ${150} 
      WHERE id = ${TEST_IDS.rewardId}
    `;
    
    const updatedResult = await sql`SELECT * FROM rewards WHERE id = ${TEST_IDS.rewardId}`;
    console.log(`${colors.green}✅ Updated reward points:${colors.reset} ${updatedResult[0].points_required}`);
    
    console.log(`${colors.green}✅ Rewards table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Rewards table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Loyalty Cards table
async function testLoyaltyCardsTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING LOYALTY CARDS TABLE${colors.reset}`);
  
  try {
    // Create test loyalty card
    const createResult = await sql`
      INSERT INTO loyalty_cards (
        id, business_id, customer_id, program_id, points_balance, tier, active, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${TEST_IDS.customerId}, ${TEST_IDS.programId}, 
        ${250}, ${'Bronze'}, ${true}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.cardId = createResult[0].id;
    console.log(`${colors.green}✅ Created test loyalty card with id: ${TEST_IDS.cardId}${colors.reset}`);
    
    // Read card
    const readResult = await sql`SELECT * FROM loyalty_cards WHERE id = ${TEST_IDS.cardId}`;
    console.log(`${colors.green}✅ Retrieved loyalty card with points:${colors.reset} ${readResult[0].points_balance}`);
    
    // Update card
    await sql`
      UPDATE loyalty_cards 
      SET points_balance = ${500} 
      WHERE id = ${TEST_IDS.cardId}
    `;
    
    const updatedResult = await sql`SELECT * FROM loyalty_cards WHERE id = ${TEST_IDS.cardId}`;
    console.log(`${colors.green}✅ Updated card points:${colors.reset} ${updatedResult[0].points_balance}`);
    
    console.log(`${colors.green}✅ Loyalty Cards table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Loyalty Cards table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Transactions table
async function testTransactionsTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING TRANSACTIONS TABLE${colors.reset}`);
  
  try {
    // Create test transaction
    const createResult = await sql`
      INSERT INTO transactions (
        id, business_id, customer_id, program_id, amount, points_earned, date, 
        type, notes, receipt_number, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${TEST_IDS.customerId}, ${TEST_IDS.programId}, 
        ${25.99}, ${260}, NOW(), ${'purchase'}, ${'Test purchase'}, ${'RCT-12345'}, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.transactionId = createResult[0].id;
    console.log(`${colors.green}✅ Created test transaction with id: ${TEST_IDS.transactionId}${colors.reset}`);
    
    // Read transaction
    const readResult = await sql`SELECT * FROM transactions WHERE id = ${TEST_IDS.transactionId}`;
    console.log(`${colors.green}✅ Retrieved transaction amount:${colors.reset} ${readResult[0].amount}`);
    
    // Update transaction
    await sql`
      UPDATE transactions 
      SET notes = ${'Updated purchase notes'} 
      WHERE id = ${TEST_IDS.transactionId}
    `;
    
    const updatedResult = await sql`SELECT * FROM transactions WHERE id = ${TEST_IDS.transactionId}`;
    console.log(`${colors.green}✅ Updated transaction notes:${colors.reset} ${updatedResult[0].notes}`);
    
    console.log(`${colors.green}✅ Transactions table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Transactions table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Settings table
async function testSettingsTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING SETTINGS TABLE${colors.reset}`);
  
  try {
    // Create test settings
    const settingsJson = JSON.stringify({
      theme: {
        primaryColor: '#1976D2',
        secondaryColor: '#424242',
        darkMode: false
      },
      notifications: {
        email: true,
        sms: false,
        pushNotifications: true
      }
    });
    
    const createResult = await sql`
      INSERT INTO settings (
        id, business_id, category, settings_data, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${'preferences'}, ${settingsJson}::jsonb, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.settingsId = createResult[0].id;
    console.log(`${colors.green}✅ Created test settings with id: ${TEST_IDS.settingsId}${colors.reset}`);
    
    // Read settings
    const readResult = await sql`SELECT * FROM settings WHERE id = ${TEST_IDS.settingsId}`;
    console.log(`${colors.green}✅ Retrieved settings category:${colors.reset} ${readResult[0].category}`);
    
    // Update settings
    const updatedSettingsJson = JSON.stringify({
      theme: {
        primaryColor: '#1976D2',
        secondaryColor: '#424242',
        darkMode: true  // Changed to true
      },
      notifications: {
        email: true,
        sms: false,
        pushNotifications: true
      }
    });
    
    await sql`
      UPDATE settings 
      SET settings_data = ${updatedSettingsJson}::jsonb 
      WHERE id = ${TEST_IDS.settingsId}
    `;
    
    const updatedResult = await sql`SELECT * FROM settings WHERE id = ${TEST_IDS.settingsId}`;
    console.log(`${colors.green}✅ Updated settings data${colors.reset}`);
    
    console.log(`${colors.green}✅ Settings table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Settings table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Redemption Codes table
async function testRedemptionCodesTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING REDEMPTION CODES TABLE${colors.reset}`);
  
  try {
    // Create test redemption code
    const createResult = await sql`
      INSERT INTO redemption_codes (
        id, business_id, code, reward_id, value_type, value_amount, 
        is_used, expires_at, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${'TEST-CODE-123'}, ${TEST_IDS.rewardId}, 
        ${'points'}, ${100}, ${false}, ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}, 
        NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.redemptionCodeId = createResult[0].id;
    console.log(`${colors.green}✅ Created test redemption code with id: ${TEST_IDS.redemptionCodeId}${colors.reset}`);
    
    // Read redemption code
    const readResult = await sql`SELECT * FROM redemption_codes WHERE id = ${TEST_IDS.redemptionCodeId}`;
    console.log(`${colors.green}✅ Retrieved redemption code:${colors.reset} ${readResult[0].code}`);
    
    // Update redemption code
    await sql`
      UPDATE redemption_codes 
      SET is_used = ${true}, used_by = ${TEST_IDS.customerId}, used_at = NOW()
      WHERE id = ${TEST_IDS.redemptionCodeId}
    `;
    
    const updatedResult = await sql`SELECT * FROM redemption_codes WHERE id = ${TEST_IDS.redemptionCodeId}`;
    console.log(`${colors.green}✅ Updated redemption code to used status:${colors.reset} ${updatedResult[0].is_used ? 'Used' : 'Unused'}`);
    
    console.log(`${colors.green}✅ Redemption Codes table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Redemption Codes table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the QR Codes table
async function testQrCodesTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING QR CODES TABLE${colors.reset}`);
  
  try {
    // Create test QR code
    const metadataJson = JSON.stringify({
      program_id: TEST_IDS.programId,
      points: 50,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    const createResult = await sql`
      INSERT INTO qr_codes (
        id, business_id, content, link_url, code_type, scans_count, 
        description, metadata, created_at, updated_at
      ) VALUES (
        ${randomUUID()}, ${TEST_IDS.businessId}, ${'https://gudcity.com/loyalty/scan?code=TEST'}, 
        ${'https://gudcity.com/loyalty/scan?code=TEST'}, ${'loyalty'}, ${0}, 
        ${'Test QR Code for Loyalty Points'}, ${metadataJson}::jsonb, NOW(), NOW()
      ) RETURNING *
    `;
    
    TEST_IDS.qrCodeId = createResult[0].id;
    console.log(`${colors.green}✅ Created test QR code with id: ${TEST_IDS.qrCodeId}${colors.reset}`);
    
    // Read QR code
    const readResult = await sql`SELECT * FROM qr_codes WHERE id = ${TEST_IDS.qrCodeId}`;
    console.log(`${colors.green}✅ Retrieved QR code content:${colors.reset} ${readResult[0].content}`);
    
    // Update QR code
    await sql`
      UPDATE qr_codes 
      SET scans_count = ${5}, unique_scans_count = ${3}
      WHERE id = ${TEST_IDS.qrCodeId}
    `;
    
    const updatedResult = await sql`SELECT * FROM qr_codes WHERE id = ${TEST_IDS.qrCodeId}`;
    console.log(`${colors.green}✅ Updated QR code scans:${colors.reset} ${updatedResult[0].scans_count}`);
    
    console.log(`${colors.green}✅ QR Codes table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ QR Codes table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test the Comments table
async function testCommentsTable() {
  console.log(`\n${colors.bright}${colors.magenta}🔍 TESTING COMMENTS TABLE${colors.reset}`);
  
  try {
    // Create test comment
    const testComment = `Test comment created at ${new Date().toISOString()}`;
    const createResult = await sql`
      INSERT INTO comments (comment) 
      VALUES (${testComment}) 
      RETURNING *
    `;
    
    console.log(`${colors.green}✅ Created test comment:${colors.reset} ${createResult[0].comment}`);
    
    // Read comments - don't rely on created_at column
    const readResult = await sql`SELECT comment FROM comments LIMIT 5`;
    console.log(`${colors.green}✅ Retrieved latest comments:${colors.reset} Found ${readResult.length} comments`);
    
    console.log(`${colors.green}✅ Comments table test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Comments table test failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Clean up test data
async function cleanupTestData() {
  try {
    // Delete in reverse order of dependencies
    if (TEST_IDS.qrCodeId) {
      await sql`DELETE FROM qr_codes WHERE id = ${TEST_IDS.qrCodeId}`;
      console.log(`${colors.yellow}🧹 Deleted test QR code${colors.reset}`);
    }
    
    if (TEST_IDS.redemptionCodeId) {
      await sql`DELETE FROM redemption_codes WHERE id = ${TEST_IDS.redemptionCodeId}`;
      console.log(`${colors.yellow}🧹 Deleted test redemption code${colors.reset}`);
    }
    
    if (TEST_IDS.settingsId) {
      await sql`DELETE FROM settings WHERE id = ${TEST_IDS.settingsId}`;
      console.log(`${colors.yellow}🧹 Deleted test settings${colors.reset}`);
    }
    
    if (TEST_IDS.transactionId) {
      await sql`DELETE FROM transactions WHERE id = ${TEST_IDS.transactionId}`;
      console.log(`${colors.yellow}🧹 Deleted test transaction${colors.reset}`);
    }
    
    if (TEST_IDS.cardId) {
      await sql`DELETE FROM loyalty_cards WHERE id = ${TEST_IDS.cardId}`;
      console.log(`${colors.yellow}🧹 Deleted test loyalty card${colors.reset}`);
    }
    
    if (TEST_IDS.rewardId) {
      await sql`DELETE FROM rewards WHERE id = ${TEST_IDS.rewardId}`;
      console.log(`${colors.yellow}🧹 Deleted test reward${colors.reset}`);
    }
    
    if (TEST_IDS.programId) {
      await sql`DELETE FROM loyalty_programs WHERE id = ${TEST_IDS.programId}`;
      console.log(`${colors.yellow}🧹 Deleted test loyalty program${colors.reset}`);
    }
    
    if (TEST_IDS.customerId) {
      await sql`DELETE FROM customers WHERE id = ${TEST_IDS.customerId}`;
      console.log(`${colors.yellow}🧹 Deleted test customer${colors.reset}`);
    }
    
    if (TEST_IDS.businessId) {
      await sql`DELETE FROM businesses WHERE id = ${TEST_IDS.businessId}`;
      console.log(`${colors.yellow}🧹 Deleted test business${colors.reset}`);
    }
    
    if (TEST_IDS.userId) {
      await sql`DELETE FROM users WHERE id = ${TEST_IDS.userId}`;
      console.log(`${colors.yellow}🧹 Deleted test user${colors.reset}`);
    }
    
    console.log(`${colors.green}✅ Successfully cleaned up all test data${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error during cleanup: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Run all tests
testAllTables().catch(err => {
  console.error(`\n${colors.bright}${colors.red}❌ Uncaught error: ${err.message}${colors.reset}`);
  process.exit(1);
}); 