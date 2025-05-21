import express from 'express';
import createHandler from './create.js';

const router = express.Router();

// POST /api/loyalty-programs/create - Create a loyalty program
router.post('/create', createHandler);

export default router; 