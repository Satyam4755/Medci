import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  consultationRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationRequest',
    required: true,
  },
  meetingTiming: {
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
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
  },
  price: {
    type: Number,
  },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
