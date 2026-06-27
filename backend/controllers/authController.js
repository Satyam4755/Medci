import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import EmailOTP from '../models/EmailOTP.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sendEmail from '../services/brevoService.js';
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const existingOtp = await EmailOTP.findOne({ email });
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
      existingOtp.otp = hashedOtp;
      existingOtp.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      existingOtp.verified = false;
      existingOtp.attempts = 0;
      await existingOtp.save();
    } else {
      await EmailOTP.create({
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to Medcii</h2>
        <p style="color: #555; text-align: center;">Your verification code is:</p>
        <h1 style="font-size: 40px; letter-spacing: 5px; color: #2563eb; text-align: center; margin: 20px 0;">${otp}</h1>
        <p style="color: #555; text-align: center;">This code will expire in 5 minutes.</p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Medcii Registration - Verification Code',
      html,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const emailOtp = await EmailOTP.findOne({ email });

    if (!emailOtp) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
    }

    if (emailOtp.attempts >= 5) {
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (new Date() > new Date(emailOtp.expiresAt)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, emailOtp.otp);

    if (!isMatch) {
      emailOtp.attempts += 1;
      await emailOtp.save();
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    emailOtp.verified = true;
    await emailOtp.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Location is required to complete registration.' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verifiedOtp = await EmailOTP.findOne({ email, verified: true });
    if (!verifiedOtp) {
      return res.status(400).json({ message: 'Email not verified. Please complete OTP verification.' });
    }

    // Format location for saving
    const userLocation = {
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || '',
      pincode: location.pincode || '',
      formattedAddress: location.formattedAddress || '',
      placeId: location.placeId || '',
      lastUpdated: new Date(),
      type: 'Point',
      coordinates: [Number(location.longitude), Number(location.latitude)]
    };

    const user = await User.create({
      name,
      email,
      password,
      role,
      emailVerified: true,
      location: userLocation
    });

    if (user) {
      await EmailOTP.deleteOne({ email });

      if (role === 'Patient') {
        await PatientProfile.create({ user: user._id });
      } else if (role === 'Doctor') {
        await DoctorProfile.create({ 
          user: user._id,
          qualification: 'Not specified',
          experience: 0,
          feeRange: { min: 0, max: 0 },
          clinicLocation: 'Not specified',
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
