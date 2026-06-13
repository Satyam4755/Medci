import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import ConsultationRequest from '../models/ConsultationRequest.js';
import EmailOTP from '../models/EmailOTP.js';
import DeleteAccountOTP from '../models/DeleteAccountOTP.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../services/brevoService.js';
import { cloudinary } from '../config/cloudinary.js';

const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const matches = url.match(/\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    const parts = url.split('/');
    return parts[parts.length - 1].split('.')[0];
  } catch (e) {
    return null;
  }
};

export const sendDeleteOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingOtp = await DeleteAccountOTP.findOne({ userId });
    if (existingOtp) {
      const timeDiff = new Date() - new Date(existingOtp.updatedAt || existingOtp.createdAt);
      if (timeDiff < 60000) {
        return res.status(429).json({ message: 'Please wait 60 seconds before requesting another OTP.' });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    if (existingOtp) {
      existingOtp.otpHash = hashedOtp;
      existingOtp.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      existingOtp.verified = false;
      existingOtp.attempts = 0;
      await existingOtp.save();
    } else {
      await DeleteAccountOTP.create({
        userId,
        email: user.email,
        otpHash: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; padding: 20px; border-radius: 10px; background-color: #fef2f2;">
        <h2 style="color: #b91c1c; text-align: center;">Account Deletion Request</h2>
        <p style="color: #555;">Hi ${user.name},</p>
        <p style="color: #555;">We received a request to permanently delete your Medcii account.</p>
        <p style="color: #555; text-align: center; margin-top: 20px;">Your verification code is:</p>
        <h1 style="font-size: 40px; letter-spacing: 5px; color: #b91c1c; text-align: center; margin: 10px 0;">${otp}</h1>
        <p style="color: #555; text-align: center;">This code will expire in 5 minutes.</p>
        <p style="color: #b91c1c; font-weight: bold; text-align: center; margin-top: 30px;">WARNING: This action is irreversible. All your data will be permanently lost.</p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">If you did not request account deletion, please ignore this email and your account will remain secure.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Medcii Account Deletion Verification',
      html,
    });

    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDeleteOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;

    const emailOtp = await DeleteAccountOTP.findOne({ userId });

    if (!emailOtp) {
      return res.status(400).json({ message: 'No OTP found for this account. Please request a new one.' });
    }

    if (emailOtp.attempts >= 5) {
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (new Date() > new Date(emailOtp.expiresAt)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, emailOtp.otpHash);

    if (!isMatch) {
      emailOtp.attempts += 1;
      await emailOtp.save();
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    emailOtp.verified = true;
    await emailOtp.save();

    res.status(200).json({ message: 'OTP verified successfully. You can now delete your account.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const verifiedOtp = await DeleteAccountOTP.findOne({ userId, verified: true });
    if (!verifiedOtp) {
      return res.status(403).json({ message: 'Not authorized. Please verify OTP first.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Cloudinary Cleanup
    if (user.profileImage) {
      const publicId = extractPublicId(user.profileImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(err => console.error("Cloudinary profileImage error:", err));
      }
    }

    // 2. Role-specific DB and Asset Cleanup
    if (user.role === 'Patient') {
      const requests = await ConsultationRequest.find({ patient: userId });
      for (const req of requests) {
        if (req.previousPrescription && req.previousPrescription.public_id) {
          await cloudinary.uploader.destroy(req.previousPrescription.public_id).catch(err => console.error(err));
        }
        if (req.hairMedia && req.hairMedia.length > 0) {
          for (const media of req.hairMedia) {
            if (media.public_id) {
              await cloudinary.uploader.destroy(media.public_id, { resource_type: media.resource_type }).catch(err => console.error(err));
            }
          }
        }
      }
      await ConsultationRequest.deleteMany({ patient: userId });
      await Appointment.deleteMany({ patient: userId });
      await PatientProfile.deleteOne({ user: userId });
    } else if (user.role === 'Doctor') {
      await ConsultationRequest.updateMany(
        { acceptedBy: userId, status: 'accepted' },
        { $unset: { acceptedBy: 1 }, status: 'pending' }
      );
      await ConsultationRequest.updateMany(
        { acceptedBy: userId },
        { $unset: { acceptedBy: 1 } }
      );
      await Appointment.deleteMany({ doctor: userId });
      await DoctorProfile.deleteOne({ user: userId });
    }

    // 3. Common Cleanup
    await EmailOTP.deleteMany({ email: user.email });
    await DeleteAccountOTP.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    res.status(200).json({ message: 'Account permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
