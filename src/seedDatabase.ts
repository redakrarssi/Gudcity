import { Pool } from 'pg';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { hashPassword } from './utils/auth';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.development.local' });

// Database connection string from environment
const dbUrl = process.env.VITE_DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Database URL not found. Make sure VITE_DATABASE_URL is set in .env.development.local');
  process.exit(1);
}

// Create a connection to the database
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

/**
 * Seed the database with test data
 */
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Generate IDs for related entities
    const adminId = nanoid();
    const business1Id = nanoid();
    const business2Id = nanoid();
    const manager1Id = nanoid();
    const manager2Id = nanoid();
    const staff1Id = nanoid();
    const staff2Id = nanoid();
    const customer1Id = nanoid();
    const customer2Id = nanoid();
    const customer3Id = nanoid();
    const customer4Id = nanoid();
    const program1Id = nanoid();
    const program2Id = nanoid();
    const reward1Id = nanoid();
    const reward2Id = nanoid();
    
    const now = new Date().toISOString();
    
    // 1. Create admin user
    console.log('📝 Creating admin user...');
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      adminId,
      'admin@example.com',
      hashPassword('admin123'),
      'System',
      'Administrator',
      'admin',
      now,
      now
    ]);
    
    // 2. Create businesses
    console.log('📝 Creating businesses...');
    await client.query(`
      INSERT INTO businesses (id, name, owner_id, address, phone, email, website, description, logo_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      business1Id,
      'Coffee Haven',
      adminId,
      '123 Main St, City, ST 12345',
      '555-123-4567',
      'hello@coffeehaven.com',
      'https://coffeehaven.example.com',
      'A cozy coffee shop with the best brews in town.',
      'https://example.com/logos/coffee-haven.png',
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO businesses (id, name, owner_id, address, phone, email, website, description, logo_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      business2Id,
      'Burger Barn',
      adminId,
      '456 Oak St, City, ST 12345',
      '555-987-6543',
      'hello@burgerbarn.com',
      'https://burgerbarn.example.com',
      'Home of the famous barn burger and farm-fresh fries.',
      'https://example.com/logos/burger-barn.png',
      now,
      now
    ]);
    
    // 3. Create business managers
    console.log('📝 Creating business managers...');
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, business_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      manager1Id,
      'manager@coffeehaven.com',
      hashPassword('manager123'),
      'Michael',
      'Johnson',
      'manager',
      business1Id,
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, business_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      manager2Id,
      'manager@burgerbarn.com',
      hashPassword('manager123'),
      'Sarah',
      'Williams',
      'manager',
      business2Id,
      now,
      now
    ]);
    
    // 4. Create staff members
    console.log('📝 Creating staff members...');
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, business_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      staff1Id,
      'staff@coffeehaven.com',
      hashPassword('staff123'),
      'David',
      'Moore',
      'staff',
      business1Id,
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, business_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      staff2Id,
      'staff@burgerbarn.com',
      hashPassword('staff123'),
      'Jessica',
      'Taylor',
      'staff',
      business2Id,
      now,
      now
    ]);
    
    // 5. Create customers
    console.log('📝 Creating customers...');
    // Customer 1 user
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      nanoid(),
      'john.doe@example.com',
      hashPassword('customer123'),
      'John',
      'Doe',
      'customer',
      now,
      now
    ]);
    
    // Customer 1 profile
    await client.query(`
      INSERT INTO customers (id, business_id, user_id, first_name, last_name, email, phone, sign_up_date, total_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      customer1Id,
      business1Id,
      nanoid(), // This would normally be linked to the user
      'John',
      'Doe',
      'john.doe@example.com',
      '555-111-2222',
      now,
      150,
      now,
      now
    ]);
    
    // Customer 2 user
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      nanoid(),
      'jane.smith@example.com',
      hashPassword('customer123'),
      'Jane',
      'Smith',
      'customer',
      now,
      now
    ]);
    
    // Customer 2 profile
    await client.query(`
      INSERT INTO customers (id, business_id, user_id, first_name, last_name, email, phone, sign_up_date, total_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      customer2Id,
      business1Id,
      nanoid(),
      'Jane',
      'Smith',
      'jane.smith@example.com',
      '555-333-4444',
      now,
      75,
      now,
      now
    ]);
    
    // Customer 3 user
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      nanoid(),
      'bob.jones@example.com',
      hashPassword('customer123'),
      'Bob',
      'Jones',
      'customer',
      now,
      now
    ]);
    
    // Customer 3 profile
    await client.query(`
      INSERT INTO customers (id, business_id, user_id, first_name, last_name, email, phone, sign_up_date, total_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      customer3Id,
      business2Id,
      nanoid(),
      'Bob',
      'Jones',
      'bob.jones@example.com',
      '555-555-6666',
      now,
      200,
      now,
      now
    ]);
    
    // Customer 4 user
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      nanoid(),
      'alice.johnson@example.com',
      hashPassword('customer123'),
      'Alice',
      'Johnson',
      'customer',
      now,
      now
    ]);
    
    // Customer 4 profile
    await client.query(`
      INSERT INTO customers (id, business_id, user_id, first_name, last_name, email, phone, sign_up_date, total_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      customer4Id,
      business2Id,
      nanoid(),
      'Alice',
      'Johnson',
      'alice.johnson@example.com',
      '555-777-8888',
      now,
      125,
      now,
      now
    ]);
    
    // 6. Create loyalty programs
    console.log('📝 Creating loyalty programs...');
    // Points program for Coffee Haven
    await client.query(`
      INSERT INTO loyalty_programs (id, business_id, name, type, description, rules, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      program1Id,
      business1Id,
      'Coffee Rewards',
      'points',
      'Earn points with every purchase. Redeem for free drinks and more!',
      JSON.stringify({
        pointsPerDollar: 10,
        minimumPurchase: 1
      }),
      true,
      now,
      now
    ]);
    
    // Punch card program for Burger Barn
    await client.query(`
      INSERT INTO loyalty_programs (id, business_id, name, type, description, rules, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      program2Id,
      business2Id,
      'Burger Club',
      'punchcard',
      'Buy 9 burgers, get the 10th free!',
      JSON.stringify({
        punchesNeeded: 10,
        reward: 'Free burger'
      }),
      true,
      now,
      now
    ]);
    
    // 7. Create rewards
    console.log('📝 Creating rewards...');
    await client.query(`
      INSERT INTO rewards (id, business_id, program_id, name, description, points_required, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      reward1Id,
      business1Id,
      program1Id,
      'Free Coffee',
      'Get a free coffee of your choice',
      100,
      true,
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO rewards (id, business_id, program_id, name, description, points_required, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      reward2Id,
      business1Id,
      program1Id,
      'Coffee & Pastry',
      'Get a free coffee and pastry of your choice',
      250,
      true,
      now,
      now
    ]);
    
    // 8. Create loyalty cards
    console.log('📝 Creating loyalty cards...');
    await client.query(`
      INSERT INTO loyalty_cards (id, business_id, customer_id, program_id, points_balance, issue_date, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      nanoid(),
      business1Id,
      customer1Id,
      program1Id,
      150,
      now,
      true,
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO loyalty_cards (id, business_id, customer_id, program_id, points_balance, issue_date, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      nanoid(),
      business1Id,
      customer2Id,
      program1Id,
      75,
      now,
      true,
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO loyalty_cards (id, business_id, customer_id, program_id, punch_count, issue_date, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      nanoid(),
      business2Id,
      customer3Id,
      program2Id,
      6,
      now,
      true,
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO loyalty_cards (id, business_id, customer_id, program_id, punch_count, issue_date, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      nanoid(),
      business2Id,
      customer4Id,
      program2Id,
      3,
      now,
      true,
      now,
      now
    ]);
    
    // 9. Create transactions
    console.log('📝 Creating transactions...');
    // Coffee Haven transactions
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
      
      await client.query(`
        INSERT INTO transactions (
          id, business_id, customer_id, program_id, amount, points_earned, 
          date, type, staff_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        nanoid(),
        business1Id,
        i % 2 === 0 ? customer1Id : customer2Id, // Alternate between customers
        program1Id,
        Math.floor(Math.random() * 20) + 5, // Random amount between 5 and 25
        Math.floor(Math.random() * 50) + 10, // Random points between 10 and 60
        date.toISOString(),
        'purchase',
        staff1Id,
        now,
        now
      ]);
    }
    
    // Burger Barn transactions
    for (let i = 0; i < 8; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
      
      await client.query(`
        INSERT INTO transactions (
          id, business_id, customer_id, program_id, amount, points_earned, 
          date, type, staff_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        nanoid(),
        business2Id,
        i % 2 === 0 ? customer3Id : customer4Id, // Alternate between customers
        program2Id,
        Math.floor(Math.random() * 15) + 10, // Random amount between 10 and 25
        1, // 1 punch per purchase
        date.toISOString(),
        'purchase',
        staff2Id,
        now,
        now
      ]);
    }
    
    // 10. Create redemption codes
    console.log('📝 Creating redemption codes...');
    // Coffee Haven codes
    for (let i = 0; i < 5; i++) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // Expires in 30 days
      
      await client.query(`
        INSERT INTO redemption_codes (
          id, business_id, code, reward_id, value_type, value_amount, 
          is_used, expires_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        nanoid(),
        business1Id,
        `COFFEE${100000 + Math.floor(Math.random() * 900000)}`, // Random 6-digit code
        i % 2 === 0 ? reward1Id : reward2Id, // Alternate between rewards
        'points',
        i % 2 === 0 ? 100 : 200, // Points based on reward
        false,
        expiryDate.toISOString(),
        now,
        now
      ]);
    }
    
    // Burger Barn codes
    for (let i = 0; i < 3; i++) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // Expires in 30 days
      
      await client.query(`
        INSERT INTO redemption_codes (
          id, business_id, code, value_type, value_amount, 
          is_used, expires_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        nanoid(),
        business2Id,
        `BURGER${100000 + Math.floor(Math.random() * 900000)}`, // Random 6-digit code
        'product',
        1, // 1 free burger
        false,
        expiryDate.toISOString(),
        now,
        now
      ]);
    }
    
    // 11. Create QR codes
    console.log('📝 Creating QR codes...');
    // Coffee Haven QR codes
    await client.query(`
      INSERT INTO qr_codes (
        id, business_id, content, link_url, code_type, 
        scans_count, unique_scans_count, description, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      nanoid(),
      business1Id,
      `LOYALTY:${business1Id}:${program1Id}`,
      `https://example.com/loyalty/${business1Id}/${program1Id}`,
      'loyalty',
      125,
      42,
      'Coffee Rewards Program QR Code',
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO qr_codes (
        id, business_id, content, link_url, code_type, 
        scans_count, unique_scans_count, description, metadata, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      nanoid(),
      business1Id,
      `PROMO:${business1Id}:SUMMER`,
      `https://example.com/promo/${business1Id}/summer`,
      'promotion',
      87,
      54,
      'Summer Special Promotion',
      JSON.stringify({ discount: '20%', validUntil: '2023-08-31' }),
      now,
      now
    ]);
    
    // Burger Barn QR codes
    await client.query(`
      INSERT INTO qr_codes (
        id, business_id, content, link_url, code_type, 
        scans_count, unique_scans_count, description, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      nanoid(),
      business2Id,
      `LOYALTY:${business2Id}:${program2Id}`,
      `https://example.com/loyalty/${business2Id}/${program2Id}`,
      'loyalty',
      95,
      38,
      'Burger Club Punch Card',
      now,
      now
    ]);
    
    // 12. Create business settings
    console.log('📝 Creating business settings...');
    // Coffee Haven settings
    await client.query(`
      INSERT INTO settings (
        id, business_id, category, settings_data, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      nanoid(),
      business1Id,
      'appearance',
      JSON.stringify({
        primaryColor: '#6F4E37',
        secondaryColor: '#D4B996',
        logo: 'https://example.com/logos/coffee-haven.png',
        fontFamily: 'Poppins, sans-serif'
      }),
      now,
      now
    ]);
    
    await client.query(`
      INSERT INTO settings (
        id, business_id, category, settings_data, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      nanoid(),
      business1Id,
      'notifications',
      JSON.stringify({
        emailNotifications: true,
        smsNotifications: false,
        reminderFrequency: 'weekly'
      }),
      now,
      now
    ]);
    
    // Burger Barn settings
    await client.query(`
      INSERT INTO settings (
        id, business_id, category, settings_data, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      nanoid(),
      business2Id,
      'appearance',
      JSON.stringify({
        primaryColor: '#D62300',
        secondaryColor: '#FFC72C',
        logo: 'https://example.com/logos/burger-barn.png',
        fontFamily: 'Montserrat, sans-serif'
      }),
      now,
      now
    ]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('🔑 Login credentials:');
    console.log('  - Admin: admin@example.com / admin123');
    console.log('  - Coffee Haven Manager: manager@coffeehaven.com / manager123');
    console.log('  - Burger Barn Manager: manager@burgerbarn.com / manager123');
    console.log('  - Customer: john.doe@example.com / customer123');
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Release client
    client.release();
    
    // Close pool
    await pool.end();
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default seedDatabase; 