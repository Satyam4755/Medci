const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ConsultationRequest = require('../models/ConsultationRequest');

// Create request via HTTP as fallback or initial save
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const newReq = await ConsultationRequest.create({
      ...req.body,
      patient: req.user._id // Assuming user ID is enough, or map to Patient ID
    });
    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
