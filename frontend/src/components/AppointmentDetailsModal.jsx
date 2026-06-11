import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentDetailsModal = ({ appointment, onClose, userRole }) => {
  const [zoomMedia, setZoomMedia] = useState(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!appointment) return null;

  const isPatient = userRole === 'patient';
  const req = appointment.consultationRequest || {};
  const docProfile = appointment.doctorProfile || {};
  const patProfile = appointment.patientProfile || {};
  
  const isDateValid = (dateStr) => {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'accepted': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-theme-border)] bg-[var(--color-theme-panel)]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-[var(--color-theme-text)]">Appointment Details</h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[var(--color-theme-dropdown)] hover:bg-[var(--color-theme-border)] flex items-center justify-center text-[var(--color-theme-text)] transition border border-[var(--color-theme-border)]"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: User Info & Main Actions */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* User Card */}
                <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)] text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--color-theme-panel)] shadow-lg mx-auto mb-4 bg-neutral-800">
                    {isPatient ? (
                      appointment.doctor?.profileImage ? (
                        <img src={appointment.doctor.profileImage} alt="Doctor" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">👨‍⚕️</div>
                      )
                    ) : (
                      appointment.patient?.profileImage ? (
                        <img src={appointment.patient.profileImage} alt="Patient" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                      )
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--color-theme-text)] mb-1">
                    {isPatient ? `Dr. ${appointment.doctor?.name}` : appointment.patient?.name}
                  </h3>
                  
                  {isPatient ? (
                    <>
                      <p className="text-sm text-[var(--color-theme-primary)] font-medium mb-2">{docProfile.qualification || 'Dermatologist'}</p>
                      <div className="text-xs text-[var(--color-theme-muted)] space-y-1 mt-4 text-left border-t border-[var(--color-theme-border)] pt-4">
                        <p><span className="font-semibold">Experience:</span> {docProfile.experience || 'N/A'} Years</p>
                        <p><span className="font-semibold">Clinic:</span> {docProfile.clinicLocation || 'Not specified'}</p>
                        <p><span className="font-semibold">Email:</span> {appointment.doctor?.email || 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--color-theme-primary)] font-medium mb-2">{appointment.patient?.email}</p>
                      <div className="text-xs text-[var(--color-theme-muted)] space-y-1 mt-4 text-left border-t border-[var(--color-theme-border)] pt-4">
                        <p><span className="font-semibold">Age:</span> {patProfile.age || 'Not specified'}</p>
                        <p><span className="font-semibold">Gender:</span> {patProfile.gender || 'Not specified'}</p>
                        <p><span className="font-semibold">Phone:</span> {patProfile.contactNumber || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Appointment Info Card */}
                <div className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)]">
                  <h4 className="text-sm font-bold text-[var(--color-theme-text)] mb-4 uppercase tracking-wider">Logistics</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-1">Date & Time</p>
                      <p className="font-medium text-[var(--color-theme-text)] text-sm">
                        {appointment.appointmentDateTime 
                          ? new Date(appointment.appointmentDateTime).toLocaleString('en-IN', { timeZone: appointment.timezone || 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
                          : (isDateValid(appointment.meetingTiming) 
                            ? new Date(appointment.meetingTiming).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                            : appointment.meetingTiming || 'To be decided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-2">Consultation Mode(s)</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.consultationModes && appointment.consultationModes.length > 0 ? (
                          appointment.consultationModes.map(m => (
                            <span key={m} className="px-2 py-1 text-xs font-bold rounded-lg bg-[var(--color-theme-primary)]/10 text-[var(--color-theme-primary)] border border-[var(--color-theme-primary)]/20 uppercase">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                            {appointment.mode === 'online' ? 'Online' : 'Clinic Visit'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-1">Estimated Duration</p>
                      <p className="font-medium text-[var(--color-theme-text)] text-sm">30 Minutes</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-1">Appointment ID</p>
                      <p className="font-mono text-[var(--color-theme-text)] text-xs bg-[var(--color-theme-dropdown)] p-2 rounded-lg truncate">
                        {appointment._id}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Request Details & Media */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Request Details */}
                <div className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)]">
                  <h4 className="text-sm font-bold text-[var(--color-theme-text)] mb-4 uppercase tracking-wider">Consultation Request</h4>
                  
                  <div className="mb-6">
                    <p className="text-xs text-[var(--color-theme-muted)] mb-2">Problem Description</p>
                    <div className="bg-[var(--color-theme-dropdown)] p-4 rounded-xl text-sm text-[var(--color-theme-text)] leading-relaxed">
                      {req.problemDescription || 'No description provided.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-[var(--color-theme-border)] pt-4">
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-1">Budget Range</p>
                      <p className="font-medium text-[var(--color-theme-text)] text-sm">
                        {req.budgetRange?.min && req.budgetRange?.max 
                          ? `₹${req.budgetRange.min} - ₹${req.budgetRange.max}` 
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-1">Requested Timing</p>
                      <p className="font-medium text-[var(--color-theme-text)] text-sm truncate" title={req.appointmentDateTime ? new Date(req.appointmentDateTime).toLocaleString() : req.preferredTiming}>
                        {req.appointmentDateTime 
                          ? new Date(req.appointmentDateTime).toLocaleString('en-IN', { timeZone: req.timezone || 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
                          : req.preferredTiming || 'Flexible'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-theme-muted)] mb-1">Search Radius</p>
                      <p className="font-medium text-[var(--color-theme-text)] text-sm">
                        {req.distancePreference ? `Within ${req.distancePreference} km` : 'Any Location'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)]">
                  <h4 className="text-sm font-bold text-[var(--color-theme-text)] mb-4 uppercase tracking-wider">Attachments & Media</h4>
                  
                  <div className="space-y-6">
                    {/* Prescription */}
                    {req.previousPrescription?.url ? (
                      <div>
                        <p className="text-xs text-[var(--color-theme-muted)] mb-2">Previous Prescription</p>
                        <div 
                          className="w-32 h-32 rounded-xl overflow-hidden border border-[var(--color-theme-border)] cursor-zoom-in relative group"
                          onClick={() => setZoomMedia({ type: 'image', url: req.previousPrescription.url })}
                        >
                          <img src={req.previousPrescription.url} alt="Prescription" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="text-white text-2xl">🔍</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                       <p className="text-xs text-[var(--color-theme-muted)] italic">No prescription attached.</p>
                    )}

                    {/* Hair Media */}
                    {req.hairMedia && req.hairMedia.length > 0 && (
                      <div>
                        <p className="text-xs text-[var(--color-theme-muted)] mb-2">Hair Condition Media</p>
                        <div className="flex flex-wrap gap-4">
                          {req.hairMedia.map((media, idx) => (
                            <div 
                              key={idx}
                              className="w-32 h-32 rounded-xl overflow-hidden border border-[var(--color-theme-border)] cursor-zoom-in relative group"
                              onClick={() => setZoomMedia({ type: media.resource_type, url: media.url })}
                            >
                              {media.resource_type === 'video' ? (
                                <>
                                  <video src={media.url} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                                      <span className="text-white text-xs pl-1">▶</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <img src={media.url} alt="Hair Issue" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <span className="text-white text-2xl">🔍</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Future Ready Section */}
                <div className="bg-[var(--color-theme-panel)] p-6 rounded-2xl border border-[var(--color-theme-border)]">
                  <h4 className="text-sm font-bold text-[var(--color-theme-text)] mb-4 uppercase tracking-wider">Quick Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button disabled className="py-3 px-4 rounded-xl bg-[var(--color-theme-primary)]/50 text-white font-medium text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2 border border-[var(--color-theme-primary)]/20">
                      <span>📹</span> Join Video Call
                    </button>
                    <button disabled className="py-3 px-4 rounded-xl bg-[var(--color-theme-dropdown)] text-[var(--color-theme-text)] font-medium text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2 border border-[var(--color-theme-border)]">
                      <span>💬</span> {isPatient ? 'Chat with Doctor' : 'Chat with Patient'}
                    </button>
                    <button disabled className="py-3 px-4 rounded-xl bg-[var(--color-theme-dropdown)] text-[var(--color-theme-text)] font-medium text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2 border border-[var(--color-theme-border)]">
                      <span>📄</span> Download Rx
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zoom Media Overlay */}
      {zoomMedia && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomMedia(null)}
        >
          <button className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition">✕</button>
          {zoomMedia.type === 'video' ? (
            <video src={zoomMedia.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={zoomMedia.url} alt="Zoomed Media" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailsModal;
