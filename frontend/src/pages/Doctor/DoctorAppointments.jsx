import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AppointmentDetailsModal from '../../components/AppointmentDetailsModal';

const DoctorAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/doctors/appointments`, config);
        setAppointments(data);
      } catch (error) {
        console.error(error);
        if (!error.response || error.response.status !== 404) {
          toast.error('Failed to load appointments');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[var(--color-theme-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isDateValid = (dateStr) => {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

  const todayStr = new Date().toDateString();

  const todaysAppointments = appointments.filter(a => {
    if (a.status !== 'scheduled') return false;
    if (isDateValid(a.meetingTiming)) {
      return new Date(a.meetingTiming).toDateString() === todayStr;
    }
    return false; // Text based dates are shown in upcoming by default
  });

  const upcomingAppointments = appointments.filter(a => {
    if (a.status !== 'scheduled') return false;
    if (isDateValid(a.meetingTiming)) {
      return new Date(a.meetingTiming).toDateString() !== todayStr && new Date(a.meetingTiming) > new Date();
    }
    return true; // Free-text timings just go to upcoming
  });

  const completedAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">My Appointments</h1>
        <p className="text-[var(--color-theme-muted)] mt-2">Manage your scheduled consultations and patient details.</p>
      </div>

      {appointments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Empty State Hero */}
          <div className="glass-panel p-12 text-center rounded-2xl border border-[var(--color-theme-border)] bg-[var(--color-theme-panel)]/50">
            <div className="w-24 h-24 bg-[var(--color-theme-dropdown)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-theme-border)] shadow-inner">
              <span className="text-5xl">📅</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Upcoming Appointments</h2>
            <p className="text-[var(--color-theme-muted)] max-w-lg mx-auto leading-relaxed">
              Once patients begin booking consultations, your appointments will appear here. Set up your availability to start receiving requests.
            </p>
          </div>

          {/* Tips Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-center text-[var(--color-theme-text)]">Tips to Grow Your Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Complete Your Profile', icon: '📝', desc: 'Patients trust complete doctor profiles. Add your experience and clinic details.' },
                { title: 'Set Availability', icon: '⏰', desc: 'Add available time slots to receive immediate bookings from patients.' },
                { title: 'Respond Quickly', icon: '⚡', desc: 'Fast response times increase your ranking and patient satisfaction.' },
                { title: 'Build Trust', icon: '⭐', desc: 'Positive reviews and successful consultations will organically grow your patient base.' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5 }}
                  className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)] hover:border-[var(--color-theme-primary)]/50 transition-colors group flex gap-4"
                >
                  <div className="flex-shrink-0 text-3xl group-hover:scale-110 transition-transform origin-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[var(--color-theme-text)] mb-1">{item.title}</h4>
                    <p className="text-sm text-[var(--color-theme-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <Link to="/doctor/availability" className="inline-flex items-center justify-center px-10 py-4 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-xl font-bold text-lg shadow-lg shadow-[var(--color-theme-primary)]/20 transition hover:-translate-y-1">
                Update Availability
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Today's Appointments</h3>
              <p className="text-4xl font-bold text-[var(--color-theme-text)]">{todaysAppointments.length}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Upcoming</h3>
              <p className="text-4xl font-bold text-[var(--color-theme-primary)]">{upcomingAppointments.length}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Completed</h3>
              <p className="text-4xl font-bold text-green-500">{completedAppointments.length}</p>
            </div>
          </div>

          {/* Appointment List */}
          <div className="space-y-4">
            <AnimatePresence>
              {appointments.map(app => (
                <motion.div 
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)] hover:border-[var(--color-theme-primary)]/30 transition flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="flex items-center gap-4 md:w-1/3">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border-2 border-[var(--color-theme-border)]">
                      {app.patient?.profileImage ? (
                        <img src={app.patient.profileImage} alt={app.patient.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[var(--color-theme-text)]">{app.patient?.name}</h3>
                      <p className="text-sm text-[var(--color-theme-muted)]">{app.consultationRequest?.problemDescription?.substring(0, 30)}...</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] uppercase tracking-wider mb-1">Date & Time</p>
                      <p className="font-medium">
                        {isDateValid(app.meetingTiming) 
                          ? new Date(app.meetingTiming).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : app.meetingTiming}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] uppercase tracking-wider mb-1">Mode</p>
                      <p className="font-medium flex items-center gap-1">
                        {app.mode === 'online' ? <span className="text-[var(--color-theme-primary)]">💻 Online</span> : <span className="text-blue-400">🏥 In-Person</span>}
                      </p>
                    </div>
                  </div>

                  <div className="md:w-1/4 flex flex-col md:items-end gap-3">
                     <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        app.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        app.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                     }`}>
                       {app.status}
                     </span>
                     <button 
                       onClick={() => setSelectedAppointment(app)}
                       className="px-4 py-2 bg-[var(--color-theme-dropdown)] hover:bg-[var(--color-theme-border)] border border-[var(--color-theme-border)] rounded-lg text-sm font-medium transition text-[var(--color-theme-text)] w-full md:w-auto"
                     >
                       View Details
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
          userRole="doctor" 
        />
      )}
    </div>
  );
};

export default DoctorAppointments;
