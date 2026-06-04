import express from 'express';
import { createRequest, getPatientRequests, getLiveRequests, acceptRequest } from '../controllers/consultationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadRequestMedia } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .post(protect, uploadRequestMedia.fields([
    { name: 'previousPrescription', maxCount: 1 },
    { name: 'hairMedia', maxCount: 10 }
  ]), createRequest); // Patients create requests

router.get('/myrequests', protect, getPatientRequests); // Patients get their requests
router.get('/live', protect, getLiveRequests); // Doctors get live requests
router.post('/:id/accept', protect, acceptRequest); // Doctors accept requests

export default router;
