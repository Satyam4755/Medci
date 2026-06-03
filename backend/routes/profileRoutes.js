import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, upload.single('profileImage'), updateProfile);

router.put('/password', protect, changePassword);

export default router;
