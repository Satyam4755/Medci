import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RaiseRequest = () => {
  const { user } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const navigate = useNavigate();

  const [problemDescription, setProblemDescription] = useState('');
  const [budgetRange, setBudgetRange] = useState([500, 2500]);
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [consultationModes, setConsultationModes] = useState(['video']);
  const [radius, setRadius] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [previousPrescription, setPreviousPrescription] = useState(null);
  const [hairMedia, setHairMedia] = useState([{ id: Date.now(), file: null }]);

  const handleAddMediaField = () => {
    setHairMedia([...hairMedia, { id: Date.now(), file: null }]);
  };

  const handleRemoveMediaField = (id) => {
    setHairMedia(hairMedia.filter(media => media.id !== id));
  };

  const handleMediaChange = (id, file) => {
    setHairMedia(hairMedia.map(media => media.id === id ? { ...media, file } : media));
  };

  const handleMinBudgetChange = (e) => {
    const val = Math.min(Number(e.target.value), budgetRange[1] - 100);
    setBudgetRange([val, budgetRange[1]]);
  };

  const handleMaxBudgetChange = (e) => {
    const val = Math.max(Number(e.target.value), budgetRange[0] + 100);
    setBudgetRange([budgetRange[0], val]);
  };

  const toggleMode = (modeId) => {
    if (consultationModes.includes(modeId)) {
      if (consultationModes.length > 1) {
        setConsultationModes(consultationModes.filter(m => m !== modeId));
      } else {
        toast.warning("Select at least one consultation mode.");
      }
    } else {
      setConsultationModes([...consultationModes, modeId]);
    }
  };

  const modesList = [
    { id: 'video', label: 'Video', icon: '📹' },
    { id: 'audio', label: 'Audio', icon: '📞' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'in-person', label: 'In-Person', icon: '🏥' }
  ];

  const submitRequest = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!appointmentDateTime) {
      toast.error('Please select an appointment date and time.');
      return;
    }

    setIsSubmitting(true);
    startLoading('Broadcasting your request...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      
      const formData = new FormData();
      formData.append('problemDescription', problemDescription);
      formData.append('budgetRange', JSON.stringify({ min: budgetRange[0], max: budgetRange[1] }));
      formData.append('appointmentDateTime', appointmentDateTime);
      formData.append('timezone', 'Asia/Kolkata');
      formData.append('consultationModes', JSON.stringify(consultationModes));
      formData.append('distancePreference', radius);
      
      // Default location for now
      formData.append('longitude', 77.2090);
      formData.append('latitude', 28.6139);

      if (previousPrescription) {
        formData.append('previousPrescription', previousPrescription);
      }

      hairMedia.forEach((media) => {
        if (media.file) {
          formData.append('hairMedia', media.file);
        }
      });

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations`, formData, config);
      toast.success('Consultation request broadcasted successfully!');
      navigate('/patient/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  // Dual Slider CSS Injection
  const dualSliderStyles = `
    .dual-slider-input {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      position: absolute;
      pointer-events: none;
      background: transparent;
      outline: none;
      z-index: 10;
    }
    .dual-slider-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      pointer-events: auto;
      height: 24px;
      width: 24px;
      border-radius: 50%;
      background: var(--color-theme-button-text);
      border: 3px solid var(--color-theme-primary);
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transition: transform 0.1s ease;
    }
    .dual-slider-input::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }
    .dual-slider-input::-moz-range-thumb {
      pointer-events: auto;
      height: 24px;
      width: 24px;
      border-radius: 50%;
      background: var(--color-theme-button-text);
      border: 3px solid var(--color-theme-primary);
      cursor: pointer;
    }
  `;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <style>{dualSliderStyles}</style>
      <h1 className="text-3xl font-bold mb-2 text-[var(--color-theme-text)]">Book an Appointment</h1>
      <p className="text-[var(--color-theme-muted)] mb-8">Fill in your details, and we'll instantly notify matching doctors in your area.</p>

      <div className="glass-panel p-8 rounded-2xl border border-[var(--color-theme-border)] shadow-xl">
        <form onSubmit={submitRequest} className="space-y-8">
          
          {/* Problem Description */}
          <div>
            <label className="block font-bold text-[var(--color-theme-text)] mb-2">Problem Description</label>
            <textarea
              required
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Describe your hair issue in detail..."
              className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50"
              rows="4"
            ></textarea>
          </div>

          {/* Attachments Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-theme-panel)] p-5 rounded-xl border border-[var(--color-theme-border)]">
              <label className="block font-bold text-[var(--color-theme-text)] mb-3">Previous Prescription</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setPreviousPrescription(e.target.files[0])}
                disabled={isSubmitting}
                className="w-full text-sm text-[var(--color-theme-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--color-theme-dropdown)] file:text-[var(--color-theme-text)] hover:file:bg-[var(--color-theme-border)] transition"
              />
            </div>

            <div className="bg-[var(--color-theme-panel)] p-5 rounded-xl border border-[var(--color-theme-border)]">
               <div className="flex justify-between items-center mb-3">
                <label className="block font-bold text-[var(--color-theme-text)]">Hair Photos / Videos</label>
                <button type="button" onClick={handleAddMediaField} className="text-xs px-2 py-1 bg-[var(--color-theme-primary)]/10 text-[var(--color-theme-primary)] rounded hover:bg-[var(--color-theme-primary)]/20 transition">+ Add</button>
               </div>
               <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                 {hairMedia.map((media) => (
                   <div key={media.id} className="flex items-center gap-2">
                     <input
                       type="file"
                       accept=".jpg,.jpeg,.png,.mp4"
                       onChange={(e) => handleMediaChange(media.id, e.target.files[0])}
                       disabled={isSubmitting}
                       className="flex-1 text-sm text-[var(--color-theme-muted)] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--color-theme-dropdown)] file:text-[var(--color-theme-text)] hover:file:bg-[var(--color-theme-border)] transition"
                     />
                     {hairMedia.length > 1 && (
                       <button type="button" onClick={() => handleRemoveMediaField(media.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full">✕</button>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <hr className="border-[var(--color-theme-border)]" />

          {/* Budget Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <label className="block font-bold text-[var(--color-theme-text)]">Consultation Budget Range</label>
              <div className="font-mono bg-[var(--color-theme-dropdown)] px-4 py-2 rounded-lg text-[var(--color-theme-primary)] font-bold border border-[var(--color-theme-border)]">
                ₹{budgetRange[0]} - ₹{budgetRange[1]}
              </div>
            </div>
            
            <div className="relative w-full h-12 flex items-center">
              {/* Background Track */}
              <div className="absolute w-full h-3 bg-[var(--color-theme-dropdown)] rounded-full border border-[var(--color-theme-border)]"></div>
              {/* Active Track */}
              <div 
                className="absolute h-3 bg-gradient-to-r from-[var(--color-theme-primary)] to-blue-400 rounded-full"
                style={{ 
                  left: `${((budgetRange[0] - 100) / 9900) * 100}%`, 
                  right: `${100 - ((budgetRange[1] - 100) / 9900) * 100}%` 
                }}
              ></div>
              
              {/* Range Inputs */}
              <input 
                type="range" 
                min={100} max={10000} step={100} 
                value={budgetRange[0]} 
                onChange={handleMinBudgetChange} 
                className="dual-slider-input" 
              />
              <input 
                type="range" 
                min={100} max={10000} step={100} 
                value={budgetRange[1]} 
                onChange={handleMaxBudgetChange} 
                className="dual-slider-input" 
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--color-theme-muted)] mt-2 font-mono">
              <span>₹100</span>
              <span>₹10,000+</span>
            </div>
          </div>

          <hr className="border-[var(--color-theme-border)]" />

          {/* Date Time & Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* DateTime Picker */}
            <div>
              <label className="block font-bold text-[var(--color-theme-text)] mb-3">Appointment Date & Time</label>
              <input
                type="datetime-local"
                required
                value={appointmentDateTime}
                onChange={(e) => setAppointmentDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                disabled={isSubmitting}
                className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 custom-datetime"
              />
              <p className="text-xs text-[var(--color-theme-muted)] mt-2 italic">Timezone: Asia/Kolkata</p>
            </div>

            {/* Radius */}
            <div>
              <label className="block font-bold text-[var(--color-theme-text)] mb-3">Search Radius (Optional)</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50"
              >
                <option value={0} className="bg-[var(--color-theme-dropdown)]">Any Location</option>
                <option value={10} className="bg-[var(--color-theme-dropdown)]">Within 10 km</option>
                <option value={25} className="bg-[var(--color-theme-dropdown)]">Within 25 km</option>
                <option value={50} className="bg-[var(--color-theme-dropdown)]">Within 50 km</option>
                <option value={100} className="bg-[var(--color-theme-dropdown)]">Within 100 km</option>
              </select>
            </div>

          </div>

          {/* Consultation Modes */}
          <div>
            <label className="block font-bold text-[var(--color-theme-text)] mb-3">Preferred Consultation Modes (Select multiple)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {modesList.map(m => {
                const isSelected = consultationModes.includes(m.id);
                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMode(m.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-[var(--color-theme-primary)] bg-[var(--color-theme-primary)]/10 text-[var(--color-theme-primary)] shadow-md shadow-[var(--color-theme-primary)]/10' 
                        : 'border-[var(--color-theme-border)] bg-[var(--color-theme-panel)] text-[var(--color-theme-muted)] hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl mb-2">{m.icon}</span>
                    <span className="font-bold text-sm">{m.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] disabled:bg-[var(--color-theme-primary)] disabled:opacity-50 text-[var(--color-theme-button-text)] py-4 rounded-xl font-bold text-lg transition shadow-xl flex items-center justify-center gap-3 mt-4"
          >
            {isSubmitting ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            {isSubmitting ? 'Broadcasting to Doctors...' : 'Book Appointment Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseRequest;
