const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all doctors (for patient listing)
router.get('/', async (req, res) => {
  res.json([]); // Placeholder
});

module.exports = router;
