import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  experience: {
    type: Number, // Years of experience
    required: true,
  },
  feeRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  availabilityTimings: [{
    day: { type: String },
    startTime: { type: String }, // e.g. "09:00 AM"
    endTime: { type: String },   // e.g. "05:00 PM"
  }],
  clinicName: {
    type: String,
  },
  consultationMode: {
    type: [String],
    enum: ['Video', 'Audio', 'Chat', 'In-Person'],
    default: ['Video'],
  },
  medicalRegistrationNumber: {
    type: String,
  },
  clinicLocation: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      default: [0, 0]
    },
  },
  bio: {
    type: String,
    default: 'Experienced hair care specialist dedicated to providing personalized treatments and achieving optimal results for every patient.'
  },
  languagesSpoken: {
    type: [String],
    default: ['English', 'Hindi']
  },
}, { timestamps: true });

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
export default DoctorProfile;
