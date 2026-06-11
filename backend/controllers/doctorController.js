import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';

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
    const { qualification, experience, minFee, maxFee, clinicLocation, longitude, latitude, availabilityTimings } = req.body;
    
    let profile = await DoctorProfile.findOne({ user: req.user._id });
    
    if (profile) {
      profile.qualification = qualification || profile.qualification;
      profile.experience = experience || profile.experience;
      profile.feeRange = { min: minFee || profile.feeRange.min, max: maxFee || profile.feeRange.max };
      profile.clinicLocation = clinicLocation || profile.clinicLocation;
      if (availabilityTimings !== undefined) {
        profile.availabilityTimings = availabilityTimings;
      }
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
      .populate('patient', 'name profileImage email')
      .populate('consultationRequest')
      .sort('meetingTiming');
      
    const patientIds = appointments.map(app => app.patient._id);
    const patientProfiles = await PatientProfile.find({ user: { $in: patientIds } });
    
    const profileMap = {};
    patientProfiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    const enrichedAppointments = appointments.map(app => {
      const appObj = app.toObject();
      appObj.patientProfile = profileMap[appObj.patient._id.toString()] || null;
      return appObj;
    });

    res.json(enrichedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorDetailsById = async (req, res) => {
  try {
    const profile = await DoctorProfile.findById(req.params.id).populate('user', 'name profileImage email');
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorEarnings = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      doctor: req.user._id, 
      status: 'completed' 
    }).populate('patient', 'name').sort({ createdAt: -1 });

    let totalEarnings = 0;
    let thisMonthEarnings = 0;
    let thisWeekEarnings = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // approximation

    const recentTransactions = appointments.slice(0, 10).map(app => ({
      _id: app._id,
      patientName: app.patient?.name || 'Unknown',
      fee: app.price || 0,
      date: app.createdAt,
      status: app.status
    }));

    appointments.forEach(app => {
      const price = app.price || 0;
      totalEarnings += price;
      
      const appDate = new Date(app.createdAt);
      if (appDate >= startOfMonth) {
        thisMonthEarnings += price;
      }
      if (appDate >= startOfWeek) {
        thisWeekEarnings += price;
      }
    });

    res.json({
      totalEarnings,
      thisMonthEarnings,
      thisWeekEarnings,
      completedConsultations: appointments.length,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
