import mongoose from 'mongoose';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { scanDocument } from '../services/ocrService.js';

// @desc    Submit verification documents
// @route   POST /api/doctor/verification/submit
// @access  Private/Doctor
export const submitVerification = async (req, res) => {
  console.log('--- START: submitVerification ---');
  console.log('Route reached: POST /api/doctors/verification/submit');
  console.log(`Authenticated Doctor ID: ${req.user._id}, Role: ${req.user.role}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    // We assume multer-storage-cloudinary has attached req.files
    // where keys are 'governmentId', 'medicalRegistration', 'qualificationCertificate', 'clinicProof'
    const files = req.files || {};
    console.log(`Uploaded files: ${Object.keys(files).join(', ') || 'None'}`);
    
    if (!files['governmentId'] || !files['medicalRegistration'] || !files['qualificationCertificate']) {
      console.log('Validation Error: Missing required verification documents.');
      return res.status(400).json({ message: 'Missing required verification documents.' });
    }

    const governmentIdUrl = files['governmentId'][0].path;
    const medicalRegistrationUrl = files['medicalRegistration'][0].path;
    const qualificationCertificateUrl = files['qualificationCertificate'][0].path;
    const clinicProofUrl = files['clinicProof'] ? files['clinicProof'][0].path : undefined;
    console.log('Cloudinary upload status: SUCCESS for required documents');

    // Simulate OCR Scanning on the medical registration (or any document)
    console.log('Starting OCR scanning...');
    const ocrData = await scanDocument(medicalRegistrationUrl, 'Medical Registration');
    console.log('OCR status: SUCCESS');

    // Update DoctorProfile with documents and OCR data
    console.log('Updating database (DoctorProfile)...');
    const doctorProfile = await DoctorProfile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          'verification.submittedAt': new Date(),
          'verification.documents': {
            governmentId: governmentIdUrl,
            medicalRegistration: medicalRegistrationUrl,
            qualificationCertificate: qualificationCertificateUrl,
            clinicProof: clinicProofUrl,
          },
          'verification.ocrData': ocrData,
        }
      },
      { new: true, session }
    );

    if (!doctorProfile) {
      throw new Error('Doctor profile not found.');
    }

    // Update User verification status
    console.log('Updating database (User verification status)...');
    const user = await User.findByIdAndUpdate(
      userId,
      { verificationStatus: 'under_review' },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();
    console.log('Database save status: SUCCESS');

    console.log('Final response: 200 Success');
    console.log('--- END: submitVerification ---');
    res.status(200).json({ 
      message: 'Verification submitted successfully.',
      verificationStatus: user.verificationStatus
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Final response: 500 Internal Server Error', error.message);
    console.log('--- END: submitVerification (ERROR) ---');
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending verifications for admin
// @route   GET /api/admin/verification/pending
// @access  Private/Admin
export const getPendingVerifications = async (req, res) => {
  try {
    const pendingDoctors = await User.aggregate([
      { $match: { role: 'Doctor', verificationStatus: 'under_review' } },
      {
        $lookup: {
          from: 'doctorprofiles',
          localField: '_id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      {
        $project: {
          name: 1,
          email: 1,
          verificationStatus: 1,
          createdAt: 1,
          'profile.verification': 1,
          'profile.qualification': 1,
          'profile.experience': 1,
          'profile.medicalRegistrationNumber': 1
        }
      }
    ]);

    res.status(200).json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a verification
// @route   POST /api/admin/verification/review/:doctorId
// @access  Private/Admin
export const reviewVerification = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { doctorId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be verified or rejected.' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const user = await User.findById(doctorId).session(session);
    if (!user) {
      throw new Error('Doctor not found.');
    }

    user.verificationStatus = status;
    await user.save({ session });

    const updateData = {
      'verification.verifiedAt': new Date(),
      'verification.verifiedBy': req.user._id,
    };

    if (status === 'rejected') {
      updateData['verification.rejectionReason'] = rejectionReason;
    }

    await DoctorProfile.findOneAndUpdate(
      { user: doctorId },
      { $set: updateData },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: `Doctor verification ${status} successfully.` });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};
