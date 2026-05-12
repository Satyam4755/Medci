import express from 'express';
import { createRequest, getPatientRequests, getLiveRequests, acceptRequest } from '../controllers/consultationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createRequest); // Patients create requests

router.get('/myrequests', protect, getPatientRequests); // Patients get their requests
router.get('/live', protect, getLiveRequests); // Doctors get live requests
router.post('/:id/accept', protect, acceptRequest); // Doctors accept requests

export default router;
