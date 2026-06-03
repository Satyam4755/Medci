import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  contactNumber: {
    type: String,
  },
  hairConcerns: {
    type: [String],
    default: [],
  },
  preferredMode: {
    type: String,
    enum: ['Video', 'Audio', 'Chat', 'In-Person'],
    default: 'Video',
  },
  emergencyContact: {
    type: String,
  },
  address: {
    type: String,
  },
}, { timestamps: true });

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile;
