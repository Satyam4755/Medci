import mongoose from 'mongoose';

const consultationRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemDescription: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  budgetRange: {
    min: { type: Number },
    max: { type: Number },
  },
  preferredTiming: {
    type: String,
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: true,
  },
  distancePreference: {
    type: Number, // Radius in km. Use 0 or large number for 'Any'
    default: 0,
  },
  location: { // Patient's location when making the request
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending',
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

consultationRequestSchema.index({ location: '2dsphere' });

const ConsultationRequest = mongoose.model('ConsultationRequest', consultationRequestSchema);
export default ConsultationRequest;
