import ConsultationRequest from '../models/ConsultationRequest.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const createRequest = async (req, res) => {
  try {
    const { problemDescription, budgetMin, budgetMax, budgetRange, preferredTiming, mode, distancePreference, longitude, latitude, appointmentDateTime, consultationModes, timezone } = req.body;
    
    // Parse budget range from either individual fields, old object structure, or new JSON string
    let bMin = budgetMin ? Number(budgetMin) : 0;
    let bMax = budgetMax ? Number(budgetMax) : 0;
    
    if (budgetRange && typeof budgetRange === 'string') {
      try { 
        const parsedBudget = JSON.parse(budgetRange); 
        bMin = parsedBudget.min || bMin;
        bMax = parsedBudget.max || bMax;
      } catch(e) {}
    } else if (budgetRange && typeof budgetRange === 'object') {
      bMin = bMin || (budgetRange.min || 0);
      bMax = bMax || (budgetRange.max || 0);
    }

    let parsedModes = [];
    if (consultationModes) {
      try { 
        parsedModes = JSON.parse(consultationModes); 
      } catch(e) {
        if (typeof consultationModes === 'string') parsedModes = consultationModes.split(',');
        else if (Array.isArray(consultationModes)) parsedModes = consultationModes;
      }
    }

    let tz = timezone || 'Asia/Kolkata';

    // Validate Consultation Modes
    if (!parsedModes || parsedModes.length === 0) {
      return res.status(400).json({ message: 'At least one consultation mode is required.' });
    }
    if (!appointmentDateTime) {
      return res.status(400).json({ message: 'Appointment Date & Time is required.' });
    }

    // Handle uploaded files
    let previousPrescription = null;
    if (req.files && req.files.previousPrescription && req.files.previousPrescription.length > 0) {
      previousPrescription = {
        url: req.files.previousPrescription[0].path,
        public_id: req.files.previousPrescription[0].filename
      };
    }

    let hairMedia = [];
    if (req.files && req.files.hairMedia) {
      hairMedia = req.files.hairMedia.map(file => ({
        url: file.path,
        public_id: file.filename,
        resource_type: file.mimetype.startsWith('video') ? 'video' : 'image'
      }));
    }

    // Handle missing location (Fallback to Patient's Profile Location)
    let finalLng = longitude ? Number(longitude) : 0;
    let finalLat = latitude ? Number(latitude) : 0;

    if (finalLng === 0 && finalLat === 0) {
      const patientUser = await User.findById(req.user._id);
      if (patientUser && patientUser.location && patientUser.location.coordinates) {
        finalLng = patientUser.location.coordinates[0];
        finalLat = patientUser.location.coordinates[1];
      }
    }

    // Create the request
    const newRequest = await ConsultationRequest.create({
      patient: req.user._id,
      problemDescription,
      previousPrescription,
      hairMedia,
      budgetRange: { min: bMin, max: bMax },
      appointmentDateTime: new Date(appointmentDateTime),
      timezone: tz,
      consultationModes: parsedModes,
      distancePreference: distancePreference ? Number(distancePreference) : 0,
      location: {
        type: 'Point',
        coordinates: [finalLng, finalLat]
      }
    });

    // Populate patient info for doctors to see
    const populatedRequest = await ConsultationRequest.findById(newRequest._id).populate('patient', 'name profileImage');

    // Matching logic
    let query = {};

    // 1. Fee range (simple overlap check)
    // For simplicity, we just find doctors where their min fee is <= budgetRange.max
    if (bMax && bMax > 0) {
      query['feeRange.min'] = { $lte: bMax };
    }

    // 2. Geolocation matching
    if (distancePreference && distancePreference > 0 && longitude && latitude) {
      const radiusInRadians = distancePreference / 6378.1; // Earth radius in km
      query.location = {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInRadians]
        }
      };
    }

    const matchedDoctors = await DoctorProfile.find(query);

    // Notify matching online doctors via Socket.IO
    const io = req.app.get('io');
    const onlineDoctors = req.app.get('onlineDoctors');

    matchedDoctors.forEach(doctor => {
      const doctorIdString = doctor.user.toString();
      const socketId = onlineDoctors.get(doctorIdString);
      if (socketId && io) {
        io.to(socketId).emit('new_request', populatedRequest);
      }
    });

    res.status(201).json({ message: 'Request created and broadcasted', request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name profileImage email')
      .populate('consultationRequest')
      .sort('-createdAt');
      
    const doctorIds = appointments.map(app => app.doctor._id);
    const doctorProfiles = await DoctorProfile.find({ user: { $in: doctorIds } });
    
    const profileMap = {};
    doctorProfiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    const enrichedAppointments = appointments.map(app => {
      const appObj = app.toObject();
      appObj.doctorProfile = profileMap[appObj.doctor._id.toString()] || null;
      return appObj;
    });

    res.json(enrichedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveRequest = async (req, res) => {
  try {
    const activeRequest = await ConsultationRequest.findOne({
      patient: req.user._id,
      status: { $in: ['pending', 'accepted', 'broadcasted', 'scheduled', 'in progress'] }
    })
    .populate('acceptedBy', 'name profileImage')
    .sort('-createdAt');

    if (activeRequest) {
      return res.json({ hasActiveRequest: true, request: activeRequest });
    }
    res.json({ hasActiveRequest: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientRequests = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ patient: req.user._id })
      .populate('acceptedBy', 'name profileImage')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLiveRequests = async (req, res) => {
  try {
    // Doctors get all pending requests. In a real scenario, we might filter this per doctor,
    // but for simplicity they can see pending ones that overlap with them
    // Real-time pushes are already filtered via createRequest socket broadcast.
    // When they load the dashboard, they can fetch currently pending requests.
    const requests = await ConsultationRequest.find({ status: 'pending' })
      .populate('patient', 'name profileImage')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Single Doctor Acceptance Logic (ATOMIC)
export const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Atomic update: only update if it is currently 'pending'
    const request = await ConsultationRequest.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'accepted', acceptedBy: req.user._id } },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({ message: 'Request already accepted by another doctor or not found.' });
    }

    // Create Appointment automatically
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    
    const newAppointment = await Appointment.create({
      patient: request.patient,
      doctor: req.user._id,
      consultationRequest: request._id,
      appointmentDateTime: request.appointmentDateTime,
      timezone: request.timezone,
      consultationModes: request.consultationModes,
      price: doctorProfile ? doctorProfile.feeRange.min : 0
    });

    // Notify all doctors to remove it from their live feed
    const io = req.app.get('io');
    if (io) {
      io.emit('request_accepted', { requestId: id, acceptedBy: req.user._id });
    }

    res.json({ message: 'Request accepted successfully', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyConsultations = async (req, res) => {
  try {
    const { lat, lng, radius = 10, mode = 'nearby' } = req.query;

    let query = { status: 'pending' };

    if (mode === 'nearby' && lat && lng) {
      const radiusInRadians = parseFloat(radius) / 6371; // km
      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      };
    }

    const requests = await ConsultationRequest.find(query)
      .populate('patient', 'name profileImage email location')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
