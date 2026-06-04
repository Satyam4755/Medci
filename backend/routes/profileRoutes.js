import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, (req, res, next) => {
    upload.single('profileImage')(req, res, function (err) {
      if (err) {
        console.error('MULTER/CLOUDINARY ERROR:', err);
        return res.status(500).json({ success: false, message: err.message, stack: err.stack });
      }
      next();
    });
  }, updateProfile);

router.put('/password', protect, changePassword);

export default router;
