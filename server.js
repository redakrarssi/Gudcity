import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Import API handlers
import usersHandler from './api/users.js';
import qrCodeHandler from './api/qrcode.js';
import rewardsHandler from './api/rewards.js';
import loyaltyCardsHandler from './api/loyalty_cards.js';
import redemptionCodesHandler from './api/redemption_codes.js';
import loyaltyProgramsHandler from './api/loyalty_programs.js';
import settingsHandler from './api/settings.js';
// Import new loyalty programs routes
import loyaltyProgramsRoutes from './api/loyalty-programs/routes.js';

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

// API Routes
// Users routes
app.all('/api/users/register', (req, res) => usersHandler(req, res));
app.all('/api/users/login', (req, res) => usersHandler(req, res));

// QR Codes routes
app.all('/api/qr_codes', (req, res) => qrCodeHandler(req, res));
app.all('/api/qr_codes/:id', (req, res) => {
  req.query.id = req.params.id;
  return qrCodeHandler(req, res);
});

// Rewards routes
app.all('/api/rewards', (req, res) => rewardsHandler(req, res));
app.all('/api/rewards/:id', (req, res) => {
  req.query.id = req.params.id;
  return rewardsHandler(req, res);
});

// Loyalty Cards routes
app.all('/api/loyalty_cards', (req, res) => loyaltyCardsHandler(req, res));
app.all('/api/loyalty_cards/:id', (req, res) => {
  req.query.id = req.params.id;
  return loyaltyCardsHandler(req, res);
});

// Redemption Codes routes
app.all('/api/redemption_codes', (req, res) => redemptionCodesHandler(req, res));
app.all('/api/redemption_codes/:code', (req, res) => {
  req.query.code = req.params.code;
  return redemptionCodesHandler(req, res);
});

// Loyalty Programs routes (original)
app.all('/api/loyalty_programs', (req, res) => loyaltyProgramsHandler(req, res));
app.all('/api/loyalty_programs/:id', (req, res) => {
  req.query.id = req.params.id;
  return loyaltyProgramsHandler(req, res);
});

// New Loyalty Programs routes with hyphen
app.use('/api/loyalty-programs', loyaltyProgramsRoutes);

// Settings routes
app.all('/api/settings', (req, res) => settingsHandler(req, res));
app.all('/api/settings/:key', (req, res) => {
  req.query.settings_key = req.params.key;
  return settingsHandler(req, res);
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
  console.log('Available endpoints:');
  console.log('- GET, POST /api/users/register');
  console.log('- GET, POST /api/users/login');
  console.log('- GET, POST, PUT, DELETE /api/qr_codes');
  console.log('- GET, POST, PUT, DELETE /api/rewards');
  console.log('- GET, POST, PUT, DELETE /api/loyalty_cards');
  console.log('- GET, POST, PUT, DELETE /api/redemption_codes');
  console.log('- GET, POST, PUT, DELETE /api/loyalty_programs');
  console.log('- GET, POST, PUT, DELETE /api/settings');
  console.log('- POST /api/loyalty-programs/create');
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
}); 