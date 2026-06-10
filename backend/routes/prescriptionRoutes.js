import express from 'express';
import { getPatientPrescriptions } from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/patient', protect, getPatientPrescriptions);

export default router;
