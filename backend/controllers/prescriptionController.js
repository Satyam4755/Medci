import Prescription from '../models/Prescription.js';

// @desc    Get prescriptions for logged-in patient
// @route   GET /api/prescriptions/patient
// @access  Private (Patient only ideally, but 'protect' middleware handles auth)
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name profileImage')
      .populate({
        path: 'appointment',
        select: 'meetingTiming status mode',
      })
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
