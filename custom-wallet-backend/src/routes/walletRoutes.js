import express from 'express';
import { getAllBanks, resolveBeneficiary, internalTransfer, getTransactionHistory } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure entire routing file natively

router.get('/banks', getAllBanks);
router.post('/resolve-beneficiary', resolveBeneficiary);
router.post('/transfer', internalTransfer);
router.get('/transactions', getTransactionHistory);

export default router;
