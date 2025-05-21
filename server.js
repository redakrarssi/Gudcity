import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Directly implement the routes
app.post('/api/users/register', async (req, res) => {
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
    
    // For testing purposes, we'll just return a success response
    // In a real implementation, you would use the database code
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'user-' + Date.now(),
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        role,
        business_id: null,
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
});

app.post('/api/users/login', async (req, res) => {
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
    
    // For testing purposes, we'll just return a success response
    // In a real implementation, you would use the database code
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'user-' + Date.now(),
        email,
        first_name: 'Test',
        last_name: 'User',
        role: email.includes('admin') ? 'admin' : 
              email.includes('business') ? 'manager' : 'customer',
        business_id: null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      details: error.message 
    });
  }
});

// Options request handler for preflight requests
app.options('*', cors());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
}); 