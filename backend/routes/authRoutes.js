import express from 'express';
import { registerUser, registerDoctorUser, authUser, getMe, sendOtp, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerUser);
router.post('/register-doctor', registerDoctorUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);

export default router;
