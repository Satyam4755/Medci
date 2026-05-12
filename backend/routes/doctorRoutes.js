import express from 'express';
import { getDoctorProfile, updateDoctorProfile, getDoctorAppointments, getAllDoctors } from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllDoctors);

router.route('/profile')
  .get(protect, getDoctorProfile)
  .put(protect, updateDoctorProfile);

router.get('/appointments', protect, getDoctorAppointments);

export default router;
