const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
  res.json({ message: 'Patient profile' });
});

module.exports = router;
