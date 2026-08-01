import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { getPendingVerifications, reviewVerification } from '../controllers/verificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);

router.get('/verification/pending', protect, admin, getPendingVerifications);
router.post('/verification/review/:doctorId', protect, admin, reviewVerification);

export default router;
