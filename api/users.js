import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Create a connection to the Neon database using the environment variable
const sql = neon(process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_PZOYgSe82srL@ep-black-credit-a2xfw9zx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require');

// Hash a password using SHA-256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different endpoints
  const path = req.url.split('/').filter(Boolean);
  
  console.log(`Processing API request: ${req.method} ${req.url}`, path);
  
  // Handle /api/users/register
  if ((path.length === 0 || path[0] === 'register') && req.method === 'POST') {
    try {
      const { email, password, firstName, lastName, role = 'customer', businessName, phoneNumber, address } = req.body;
      
      console.log('Processing registration for:', email);
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      // Check if user already exists
      const existingUser = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      
      if (existingUser.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Hash the password
      const password_hash = hashPassword(password);
      
      let businessId = null;
      
      // If it's a business account, create a business record first
      if (role === 'manager' || role === 'staff') {
        if (!businessName) {
          return res.status(400).json({ 
            success: false, 
            message: 'Business name is required for business accounts' 
          });
        }
        
        // Create business
        const businessResult = await sql`
          INSERT INTO businesses (
            name, 
            phone, 
            address
          ) VALUES (
            ${businessName}, 
            ${phoneNumber || null}, 
            ${address || null}
          ) RETURNING id
        `;
        
        businessId = businessResult[0].id;
      }
      
      // Create the user
      const userResult = await sql`
        INSERT INTO users (
          email, 
          password_hash, 
          first_name, 
          last_name, 
          role, 
          business_id
        ) VALUES (
          ${email}, 
          ${password_hash}, 
          ${firstName || null}, 
          ${lastName || null}, 
          ${role}, 
          ${businessId}
        ) RETURNING id, email, first_name, last_name, role, business_id
      `;
      
      // If customer role, create customer record
      if (role === 'customer') {
        await sql`
          INSERT INTO customers (
            user_id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            address
          ) VALUES (
            ${userResult[0].id}, 
            ${firstName || null}, 
            ${lastName || null}, 
            ${email}, 
            ${phoneNumber || null}, 
            ${address || null}
          )
        `;
      }
      
      // If it's a business owner, update the business with the owner id
      if (role === 'manager' && businessId) {
        await sql`
          UPDATE businesses 
          SET owner_id = ${userResult[0].id} 
          WHERE id = ${businessId}
        `;
      }
      
      // Return the created user without the password
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: userResult[0].id,
          email: userResult[0].email,
          first_name: userResult[0].first_name,
          last_name: userResult[0].last_name,
          role: userResult[0].role,
          business_id: userResult[0].business_id,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        details: error.message 
      });
    }
  }
  
  // Handle /api/users/login
  if ((path.length === 0 || path[0] === 'login') && req.method === 'POST') {
    try {
      const { email, password } = req.body;
      
      console.log('Processing login for:', email);
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      // Get user by email
      const users = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      const user = users[0];
      
      // Check password
      const hashedPassword = hashPassword(password);
      if (hashedPassword !== user.password_hash) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Return the user without the password
      const { password_hash, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        details: error.message 
      });
    }
  }
  
  // Handle invalid endpoint
  return res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
} 