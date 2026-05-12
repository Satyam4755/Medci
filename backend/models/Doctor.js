const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number, // In years
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  availabilityTimings: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  clinicLocation: {
    address: String,
    city: String,
    state: String
  },
  location: { // For Geo queries
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'both'],
    default: 'both'
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  isAvailableNow: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
