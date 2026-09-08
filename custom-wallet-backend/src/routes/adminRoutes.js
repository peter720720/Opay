import express from 'express';
import { fundUserAccount } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Strict security chaining: Requires a valid session token AND verified admin privileges
router.post('/fund-user', protect, isAdmin, fundUserAccount);

export default router;
