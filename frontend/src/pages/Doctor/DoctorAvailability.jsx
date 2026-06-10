import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityModal = ({ isOpen, onClose, currentTimings, onSave }) => {
  const [timings, setTimings] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Initialize with existing or empty templates for all days
      const initial = DAYS_OF_WEEK.map(day => {
        const existing = currentTimings.find(t => t.day === day);
        return existing || { day, startTime: '', endTime: '' };
      });
      setTimings(initial);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, currentTimings]);

  if (!isOpen) return null;

  const handleTimeChange = (index, field, value) => {
    const updated = [...timings];
    updated[index][field] = value;
    setTimings(updated);
  };

  const handleSave = () => {
    // Filter out rows where one of the times is missing
    const validTimings = timings.filter(t => t.startTime && t.endTime);
    onSave(validTimings);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[var(--color-theme-panel)] rounded-2xl border border-[var(--color-theme-border)] shadow-2xl overflow-hidden text-[var(--color-theme-text)] max-h-[90vh] flex flex-col relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)] z-10 p-2">✕</button>
        
        <div className="p-6 border-b border-[var(--color-theme-border)] bg-[var(--color-theme-dropdown)]">
          <h2 className="text-2xl font-bold">Set Availability</h2>
          <p className="text-[var(--color-theme-muted)] mt-1">Configure your weekly consultation hours.</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-bold text-[var(--color-theme-muted)] uppercase tracking-wider mb-2">
            <div className="col-span-4">Day</div>
            <div className="col-span-4">Start Time</div>
            <div className="col-span-4">End Time</div>
          </div>
          {timings.map((t, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-center">
               <div className="col-span-4 font-medium">{t.day}</div>
               <div className="col-span-4">
                 <input 
                   type="time" 
                   value={t.startTime} 
                   onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                   className="w-full p-2 bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] rounded-lg focus:outline-none focus:border-[var(--color-theme-primary)]"
                 />
               </div>
               <div className="col-span-4">
                 <input 
                   type="time" 
                   value={t.endTime} 
                   onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                   className="w-full p-2 bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] rounded-lg focus:outline-none focus:border-[var(--color-theme-primary)]"
                 />
               </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[var(--color-theme-border)] bg-[var(--color-theme-panel)] flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-2 border border-[var(--color-theme-border)] hover:bg-[var(--color-theme-dropdown)] text-[var(--color-theme-text)] rounded-lg font-medium transition">
             Cancel
           </button>
           <button onClick={handleSave} className="px-6 py-2 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-lg font-medium transition">
             Save Schedule
           </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};


const DoctorAvailability = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/doctors/profile`, config);
        setProfile(data);
      } catch (error) {
        console.error(error);
        if (!error.response || error.response.status !== 404) {
          toast.error('Failed to load profile details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.token]);

  const handleSaveAvailability = async (newTimings) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/doctors/profile`, { availabilityTimings: newTimings }, config);
      setProfile(data);
      toast.success('Availability updated successfully');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to update availability');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[var(--color-theme-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const availability = profile?.availabilityTimings || [];
  const hasAvailability = availability.length > 0;

  // Calculate some dummy stats for the summary cards
  const activeDays = availability.length;
  // Calculate total hours roughly
  const totalHours = availability.reduce((acc, curr) => {
     if(!curr.startTime || !curr.endTime) return acc;
     const [sh, sm] = curr.startTime.split(':').map(Number);
     const [eh, em] = curr.endTime.split(':').map(Number);
     const hours = (eh + em/60) - (sh + sm/60);
     return acc + (hours > 0 ? hours : hours + 24); // Handle overnight loosely
  }, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">Availability Schedule</h1>
          <p className="text-[var(--color-theme-muted)] mt-2">Set the hours when patients can book consultations with you.</p>
        </div>
        {hasAvailability && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-xl font-bold transition shadow-lg shadow-[var(--color-theme-primary)]/20"
          >
            Edit Availability
          </button>
        )}
      </div>

      {!hasAvailability ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Empty State Hero */}
          <div className="glass-panel p-12 text-center rounded-2xl border border-[var(--color-theme-border)] bg-[var(--color-theme-panel)]/50">
            <div className="w-24 h-24 bg-[var(--color-theme-dropdown)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-theme-border)] shadow-inner">
              <span className="text-5xl">⏰</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Set Your Availability</h2>
            <p className="text-[var(--color-theme-muted)] max-w-lg mx-auto leading-relaxed">
              Patients can only book consultations during your available hours. Create your schedule to start receiving appointments.
            </p>
          </div>

          {/* Benefits Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-center text-[var(--color-theme-text)]">Why Set Your Schedule?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Receive More Requests', icon: '📈' },
                { title: 'Better Patient Experience', icon: '🤝' },
                { title: 'Reduce Scheduling Conflicts', icon: '⚖️' },
                { title: 'Increase Consultation Success', icon: '🏆' }
              ].map((item, idx) => (
                <div key={idx} className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)] text-center group hover:border-[var(--color-theme-primary)] transition">
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                  <h4 className="font-semibold text-sm text-[var(--color-theme-text)]">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Preview */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-sm font-bold text-[var(--color-theme-muted)] uppercase tracking-wider mb-4 text-center">Sample Weekly Calendar</h3>
            <div className="bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] rounded-2xl overflow-hidden opacity-60 pointer-events-none">
               {['Monday', 'Tuesday', 'Wednesday'].map((day, i) => (
                 <div key={day} className={`p-4 flex justify-between items-center ${i !== 2 ? 'border-b border-[var(--color-theme-border)]' : ''}`}>
                   <span className="font-medium">{day}</span>
                   <span className="text-[var(--color-theme-primary)] font-mono bg-[var(--color-theme-dropdown)] px-3 py-1 rounded">09:00 AM - 05:00 PM</span>
                 </div>
               ))}
               <div className="p-4 border-t border-[var(--color-theme-border)] text-center text-[var(--color-theme-muted)] text-sm italic bg-[var(--color-theme-dropdown)]">
                 And so on for your active days...
               </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-8 mt-12">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-10 py-4 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-xl font-bold text-lg shadow-lg shadow-[var(--color-theme-primary)]/20 transition hover:-translate-y-1"
            >
              Create Availability Schedule
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Active Days</h3>
              <p className="text-3xl font-bold text-[var(--color-theme-primary)]">{activeDays} <span className="text-lg text-[var(--color-theme-muted)] font-normal">/ week</span></p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Total Hours</h3>
              <p className="text-3xl font-bold text-[var(--color-theme-text)]">~{Math.round(totalHours)} <span className="text-lg text-[var(--color-theme-muted)] font-normal">hrs</span></p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Consultation Modes</h3>
              <div className="flex gap-2 mt-2">
                {profile.consultationMode?.slice(0,2).map(m => (
                  <span key={m} className="px-2 py-1 bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] rounded text-xs">{m}</span>
                ))}
                {profile.consultationMode?.length > 2 && <span className="px-2 py-1 bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] rounded text-xs">+{profile.consultationMode.length - 2}</span>}
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Status</h3>
              <p className="text-lg font-bold text-green-500 flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> Active
              </p>
            </div>
          </div>

          {/* Weekly Schedule Display */}
          <div className="glass-panel rounded-2xl border border-[var(--color-theme-border)] overflow-hidden">
            <div className="bg-[var(--color-theme-dropdown)] p-6 border-b border-[var(--color-theme-border)]">
              <h3 className="font-bold text-xl">Weekly Schedule</h3>
            </div>
            <div className="divide-y divide-[var(--color-theme-border)]">
              {DAYS_OF_WEEK.map((day) => {
                const dayData = availability.find(t => t.day === day);
                return (
                  <div key={day} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[var(--color-theme-panel)]/50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${dayData ? 'bg-green-500' : 'bg-neutral-600'}`}></div>
                      <span className={`font-medium text-lg ${dayData ? 'text-[var(--color-theme-text)]' : 'text-[var(--color-theme-muted)]'}`}>{day}</span>
                    </div>
                    <div>
                      {dayData ? (
                        <div className="inline-flex items-center gap-3 bg-[var(--color-theme-dropdown)] px-4 py-2 rounded-lg border border-[var(--color-theme-border)]">
                          <span className="font-mono text-[var(--color-theme-primary)] font-medium">
                            {/* Assuming standard HH:mm format conversion for display, or just using raw */}
                            {dayData.startTime}
                          </span>
                          <span className="text-[var(--color-theme-muted)]">to</span>
                          <span className="font-mono text-[var(--color-theme-primary)] font-medium">
                            {dayData.endTime}
                          </span>
                        </div>
                      ) : (
                        <span className="px-4 py-2 text-[var(--color-theme-muted)] italic">Unavailable</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <AvailabilityModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            currentTimings={availability}
            onSave={handleSaveAvailability}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorAvailability;
