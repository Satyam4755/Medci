const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationRequest',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  meetingLink: {
    type: String, // For online consultations
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  prescription: {
    type: String,
    default: ''
  },
  medicinesPrescribed: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    dosage: String,
    duration: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
