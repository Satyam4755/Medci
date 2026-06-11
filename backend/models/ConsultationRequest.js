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
  previousPrescription: {
    url: String,
    public_id: String
  },
  hairMedia: [{
    url: String,
    public_id: String,
    resource_type: String
  }],
  budgetRange: {
    min: { type: Number },
    max: { type: Number },
  },
  preferredTiming: {
    type: String,
  },
  appointmentDateTime: {
    type: Date,
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  consultationModes: {
    type: [String],
    enum: ['video', 'audio', 'chat', 'in-person'],
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
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

consultationRequestSchema.post('init', function (doc) {
  if (doc.mode && (!doc.consultationModes || doc.consultationModes.length === 0)) {
    doc.consultationModes = doc.mode.toLowerCase() === 'online' ? ['video'] : ['in-person'];
  }
  if (doc.preferredTiming && !doc.appointmentDateTime) {
    // For legacy strings, we might not be able to parse to Date easily, but we can store it back in preferredTiming
    // Since preferredTiming is in the schema, it will just read correctly.
  }
});

const ConsultationRequest = mongoose.model('ConsultationRequest', consultationRequestSchema);
export default ConsultationRequest;
