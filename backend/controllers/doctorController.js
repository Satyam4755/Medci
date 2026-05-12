import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate('user', 'name profileImage');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const { qualification, experience, minFee, maxFee, clinicLocation, longitude, latitude } = req.body;
    
    let profile = await DoctorProfile.findOne({ user: req.user._id });
    
    if (profile) {
      profile.qualification = qualification || profile.qualification;
      profile.experience = experience || profile.experience;
      profile.feeRange = { min: minFee || profile.feeRange.min, max: maxFee || profile.feeRange.max };
      profile.clinicLocation = clinicLocation || profile.clinicLocation;
      if (longitude !== undefined && latitude !== undefined) {
        profile.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
      }
      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name profileImage')
      .populate('consultationRequest', 'problemDescription mode')
      .sort('meetingTiming');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
