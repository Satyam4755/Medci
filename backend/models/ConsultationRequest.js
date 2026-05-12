const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  problemDescription: {
    type: String,
    required: true
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  preferredTiming: {
    type: Date,
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  locationPreference: {
    type: String,
    enum: ['any', 'radius'],
    default: 'any'
  },
  radiusInKm: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('ConsultationRequest', requestSchema);
