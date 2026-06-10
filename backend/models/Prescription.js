import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  notes: {
    type: String,
  },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g. "1 Tablet"
    frequency: { type: String, required: true }, // e.g. "Twice a day after meals"
    duration: { type: String, required: true }, // e.g. "5 days"
  }],
  file: {
    url: String,
    public_id: String,
  },
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
