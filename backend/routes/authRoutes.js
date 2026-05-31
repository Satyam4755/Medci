import express from 'express';
import { registerUser, authUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
// for authentication...
router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);

export default router;
