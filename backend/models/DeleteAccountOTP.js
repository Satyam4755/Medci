import mongoose from 'mongoose';

const deleteAccountOTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const DeleteAccountOTP = mongoose.model('DeleteAccountOTP', deleteAccountOTPSchema);
export default DeleteAccountOTP;
