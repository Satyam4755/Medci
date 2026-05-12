import User from '../models/User.js';
import ConsultationRequest from '../models/ConsultationRequest.js';
import Appointment from '../models/Appointment.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const activeRequests = await ConsultationRequest.countDocuments({ status: 'pending' });
    
    const appointments = await Appointment.find(); // Assuming all appointments generate revenue or we filter by completed
    const totalRevenue = appointments.reduce((acc, appt) => acc + (appt.price || 0), 0);
    const totalCommission = totalRevenue * 0.1; // 10% platform fee

    res.json({
      totalUsers,
      totalDoctors,
      activeRequests,
      totalRevenue,
      totalCommission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
