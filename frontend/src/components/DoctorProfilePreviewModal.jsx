import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DoctorProfilePreviewModal = ({ doctorId, isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!isOpen || !doctorId) return;
      
      setLoading(true);
      setProfile(null);
      
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/doctors/${doctorId}`, config);
        setProfile(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load doctor profile.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [isOpen, doctorId, user.token, onClose]);

  // Handle body scroll lock and escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRaiseRequest = () => {
    onClose();
    navigate('/patient/request');
    // In the future, this could navigate to /patient/request?doctorId=xxx to auto-select the doctor.
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-[var(--color-theme-panel)] rounded-t-3xl md:rounded-2xl border border-[var(--color-theme-border)] shadow-2xl text-[var(--color-theme-text)] relative max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header / Draggable area indicator for mobile */}
        <div className="md:hidden flex justify-center py-3 border-b border-[var(--color-theme-border)] bg-[var(--color-theme-panel)] z-10 sticky top-0">
           <div className="w-12 h-1.5 bg-[var(--color-theme-border)] rounded-full"></div>
        </div>

        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)] z-20 p-2 bg-[var(--color-theme-panel)] rounded-full shadow-md"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
          {loading || !profile ? (
            <div className="space-y-6 animate-pulse">
               <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                 <div className="w-24 h-24 rounded-full bg-neutral-700/50"></div>
                 <div className="space-y-3 flex-1 text-center md:text-left">
                   <div className="h-8 bg-neutral-700/50 rounded-lg w-1/2 mx-auto md:mx-0"></div>
                   <div className="h-4 bg-neutral-700/50 rounded-lg w-1/3 mx-auto md:mx-0"></div>
                   <div className="h-4 bg-neutral-700/50 rounded-lg w-1/4 mx-auto md:mx-0"></div>
                 </div>
               </div>
               <div className="h-32 bg-neutral-700/50 rounded-xl w-full"></div>
               <div className="h-32 bg-neutral-700/50 rounded-xl w-full"></div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-[var(--color-theme-primary)] shadow-lg relative">
                  {profile.user?.profileImage ? (
                    <img src={profile.user.profileImage} alt={`Dr. ${profile.user?.name}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-4xl text-[var(--color-theme-muted)]">?</div>
                  )}
                  {/* Availability Badge */}
                  <div className="absolute bottom-1 right-3 w-4 h-4 bg-green-500 border-2 border-[var(--color-theme-panel)] rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-theme-text)]">Dr. {profile.user?.name}</h2>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full mx-auto md:mx-0 w-max border border-green-500/20">
                      Online Now
                    </span>
                  </div>
                  <p className="text-lg text-[var(--color-theme-primary)] font-medium">{profile.qualification}</p>
                  <p className="text-[var(--color-theme-muted)] mt-1">{profile.experience} Years of Experience</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                    <div className="px-3 py-1.5 bg-[var(--color-theme-dropdown)] rounded-lg text-sm border border-[var(--color-theme-border)]">
                      <span className="text-[var(--color-theme-muted)]">Fee:</span> <span className="font-semibold">₹{profile.feeRange?.min} - ₹{profile.feeRange?.max}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-[var(--color-theme-dropdown)] rounded-lg text-sm border border-[var(--color-theme-border)]">
                      <span className="text-[var(--color-theme-muted)]">Reg No:</span> <span className="font-semibold">{profile.medicalRegistrationNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-[var(--color-theme-border)]" />

              {/* Professional Information */}
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="text-[var(--color-theme-primary)] mr-2">👨‍⚕️</span> Professional Bio
                </h3>
                <p className="text-[var(--color-theme-muted)] leading-relaxed bg-[var(--color-theme-dropdown)] p-4 rounded-xl border border-[var(--color-theme-border)]">
                  {profile.bio}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm font-semibold text-[var(--color-theme-muted)] py-1">Languages Spoken:</span>
                  {profile.languagesSpoken?.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full border border-neutral-700">
                      {lang}
                    </span>
                  ))}
                </div>
              </section>

              {/* Clinic Information */}
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="text-[var(--color-theme-primary)] mr-2">🏥</span> Clinic Information
                </h3>
                <div className="bg-[var(--color-theme-dropdown)] p-4 rounded-xl border border-[var(--color-theme-border)] flex flex-col gap-2">
                   <div>
                     <span className="text-[var(--color-theme-muted)] text-sm">Clinic Name</span>
                     <p className="font-medium text-lg">{profile.clinicName || 'Independent Practitioner'}</p>
                   </div>
                   <div>
                     <span className="text-[var(--color-theme-muted)] text-sm">Location</span>
                     <p className="font-medium">{profile.clinicLocation}</p>
                   </div>
                </div>
              </section>

              {/* Consultation Information */}
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="text-[var(--color-theme-primary)] mr-2">🩺</span> Consultation Modes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {['Video', 'Audio', 'Chat', 'In-Person'].map((mode) => {
                    const isAvailable = profile.consultationMode?.includes(mode);
                    return (
                      <div 
                        key={mode} 
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${isAvailable ? 'bg-[var(--color-theme-primary)]/10 border-[var(--color-theme-primary)]/30 text-[var(--color-theme-primary)]' : 'bg-[var(--color-theme-dropdown)] border-[var(--color-theme-border)] text-[var(--color-theme-muted)] opacity-50'}`}
                      >
                        <span className="text-lg">
                          {mode === 'Video' ? '📹' : mode === 'Audio' ? '📞' : mode === 'Chat' ? '💬' : '🏥'}
                        </span>
                        <span className="font-medium text-sm">{mode}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Patient Reviews Placeholder */}
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="text-yellow-500 mr-2">⭐</span> Patient Reviews
                </h3>
                <div className="bg-[var(--color-theme-dropdown)] p-8 rounded-xl border border-[var(--color-theme-border)] text-center">
                   <p className="text-[var(--color-theme-muted)] italic">"No reviews available yet"</p>
                </div>
              </section>

            </div>
          )}
        </div>

        {/* Action Buttons - Sticky at bottom */}
        <div className="border-t border-[var(--color-theme-border)] p-4 bg-[var(--color-theme-panel)] flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-[var(--color-theme-border)] hover:bg-[var(--color-theme-dropdown)] transition font-medium text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)] order-2 sm:order-1"
          >
            Close Profile
          </button>
          <button
            onClick={handleRaiseRequest}
            disabled={loading || !profile}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-theme-primary)]/20 order-1 sm:order-2"
          >
            Raise Consultation Request
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DoctorProfilePreviewModal;
