import express from 'express';
import { sendDeleteOtp, verifyDeleteOtp, deleteAccount } from '../controllers/accountController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-delete-otp', protect, sendDeleteOtp);
router.post('/verify-delete-otp', protect, verifyDeleteOtp);
router.delete('/delete', protect, deleteAccount);

export default router;
