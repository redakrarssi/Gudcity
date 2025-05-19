import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import API handlers
import * as users from './api/users.ts';
import * as customers from './api/customers.ts';
import * as programs from './api/programs.ts';
import * as transactions from './api/transactions.ts';
import * as qr from './api/qr.ts';

// Load environment variables
dotenv.config({ path: '.env.development.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.post('/api/users/register', users.register);
app.post('/api/users/login', users.login);
app.get('/api/users/:id', users.getUserProfile);
app.put('/api/users/:id', users.updateUserProfile);

app.get('/api/customers', customers.getCustomers);
app.get('/api/customers/:id', customers.getCustomer);
app.post('/api/customers', customers.createCustomer);
app.put('/api/customers/:id', customers.updateCustomer);
app.delete('/api/customers/:id', customers.deleteCustomer);

app.get('/api/programs', programs.getPrograms);
app.get('/api/programs/:id', programs.getProgram);
app.post('/api/programs', programs.createProgram);
app.put('/api/programs/:id', programs.updateProgram);
app.delete('/api/programs/:id', programs.deleteProgram);

app.get('/api/transactions', transactions.getTransactions);
app.post('/api/transactions', transactions.createTransaction);
app.get('/api/transactions/:id', transactions.getTransaction);

app.post('/api/qr/generate', qr.generateQrCode);
app.post('/api/qr/scan', qr.scanQrCode);
app.get('/api/qr/:id', qr.getQrCode);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 