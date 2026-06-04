import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'Patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'Doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
    }

    res.json({
      user,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic user info
    if (req.body.name) user.name = req.body.name;
    
    // Handle profile image upload from Cloudinary
    if (req.file) {
      user.profileImage = req.file.path; // Cloudinary URL
    }
    
    await user.save();

    // Update specific profile info based on role
    let updatedProfile = null;
    if (user.role === 'Patient') {
      let patientProfile = await PatientProfile.findOne({ user: user._id });
      if (!patientProfile) {
        patientProfile = new PatientProfile({ user: user._id });
      }
      
      const pFields = ['age', 'gender', 'contactNumber', 'preferredMode', 'emergencyContact', 'address'];
      pFields.forEach(field => {
        if (req.body[field] !== undefined) patientProfile[field] = req.body[field];
      });
      
      if (req.body['hairConcerns[]']) {
        patientProfile.hairConcerns = Array.isArray(req.body['hairConcerns[]']) 
          ? req.body['hairConcerns[]'] 
          : [req.body['hairConcerns[]']];
      }
      
      updatedProfile = await patientProfile.save();
    } else if (user.role === 'Doctor') {
      let doctorProfile = await DoctorProfile.findOne({ user: user._id });
      if (!doctorProfile) {
        doctorProfile = new DoctorProfile({ user: user._id });
      }

      const dFields = ['clinicName', 'medicalRegistrationNumber'];
      dFields.forEach(field => {
        if (req.body[field] !== undefined) doctorProfile[field] = req.body[field];
      });

      if (req.body['consultationMode[]']) {
        doctorProfile.consultationMode = Array.isArray(req.body['consultationMode[]']) 
          ? req.body['consultationMode[]'] 
          : [req.body['consultationMode[]']];
      }

      doctorProfile.qualification = req.body.qualification || doctorProfile.qualification || 'Not provided';
      doctorProfile.experience = req.body.experience || doctorProfile.experience || 0;
      doctorProfile.clinicLocation = req.body.clinicLocation || doctorProfile.clinicLocation || 'Not provided';

      doctorProfile.feeRange = { 
        min: req.body.feeMin || doctorProfile.feeRange?.min || 0, 
        max: req.body.feeMax || doctorProfile.feeRange?.max || 0 
      };

      updatedProfile = await doctorProfile.save();
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      profile: updatedProfile
    });
  } catch (error) {
    console.error('PROFILE UPDATE ERROR:');
    console.error(error);
    console.error(error.stack);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// @desc    Change Password
// @route   PUT /api/profile/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both old and new passwords' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};
