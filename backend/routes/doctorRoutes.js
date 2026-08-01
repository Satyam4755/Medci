import express from 'express';
import { getDoctorProfile, updateDoctorProfile, getDoctorAppointments, getAllDoctors, getDoctorDetailsById, getDoctorEarnings, getNearbyDoctors } from '../controllers/doctorController.js';
import { protect, verifiedDoctor, doctorOnly } from '../middleware/authMiddleware.js';
import { submitVerification } from '../controllers/verificationController.js';
import { uploadVerification } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllDoctors);

router.route('/profile')
  .get(protect, getDoctorProfile)
  .put(protect, updateDoctorProfile);

router.post('/verification/submit', protect, doctorOnly, uploadVerification.fields([
  { name: 'governmentId', maxCount: 1 },
  { name: 'medicalRegistration', maxCount: 1 },
  { name: 'qualificationCertificate', maxCount: 1 },
  { name: 'clinicProof', maxCount: 1 }
]), submitVerification);

router.get('/nearby', protect, getNearbyDoctors);

router.get('/appointments', protect, verifiedDoctor, getDoctorAppointments);

router.get('/earnings', protect, verifiedDoctor, getDoctorEarnings);

router.get('/:id', protect, getDoctorDetailsById);

export default router;
