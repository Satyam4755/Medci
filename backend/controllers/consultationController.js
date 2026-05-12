import ConsultationRequest from '../models/ConsultationRequest.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

export const createRequest = async (req, res) => {
  try {
    const { problemDescription, images, budgetRange, preferredTiming, mode, distancePreference, longitude, latitude } = req.body;
    
    // Create the request
    const newRequest = await ConsultationRequest.create({
      patient: req.user._id,
      problemDescription,
      images: images || [],
      budgetRange,
      preferredTiming,
      mode,
      distancePreference,
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0]
      }
    });

    // Populate patient info for doctors to see
    const populatedRequest = await ConsultationRequest.findById(newRequest._id).populate('patient', 'name profileImage');

    // Matching logic
    let query = {};

    // 1. Fee range (simple overlap check)
    // For simplicity, we just find doctors where their min fee is <= budgetRange.max
    if (budgetRange && budgetRange.max) {
      query['feeRange.min'] = { $lte: budgetRange.max };
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
      meetingTiming: request.preferredTiming || 'To be decided',
      mode: request.mode,
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
