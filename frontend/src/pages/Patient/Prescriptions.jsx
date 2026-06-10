import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

const PrescriptionModal = ({ prescription, isOpen, onClose }) => {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !prescription) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[var(--color-theme-panel)] rounded-2xl border border-[var(--color-theme-border)] shadow-2xl overflow-hidden text-[var(--color-theme-text)] max-h-[90vh] flex flex-col relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)] z-10 p-2">✕</button>
        
        <div className="p-6 border-b border-[var(--color-theme-border)] bg-[var(--color-theme-dropdown)]">
          <h2 className="text-2xl font-bold">Prescription Details</h2>
          <p className="text-[var(--color-theme-muted)] mt-1">Prescribed on {new Date(prescription.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 border-2 border-[var(--color-theme-primary)]">
               {prescription.doctor?.profileImage ? (
                 <img src={prescription.doctor.profileImage} alt="Doctor" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-2xl">👨‍⚕️</div>
               )}
            </div>
            <div>
              <h3 className="font-bold text-xl">Dr. {prescription.doctor?.name}</h3>
              <p className="text-[var(--color-theme-muted)]">{prescription.appointment?.mode === 'online' ? 'Online Consultation' : 'In-Person Consultation'}</p>
            </div>
          </div>

          {prescription.notes && (
            <div>
              <h4 className="font-bold text-lg mb-2 text-[var(--color-theme-primary)]">Doctor's Notes</h4>
              <div className="bg-[var(--color-theme-dropdown)] p-4 rounded-xl border border-[var(--color-theme-border)]">
                <p className="text-[var(--color-theme-muted)] whitespace-pre-wrap">{prescription.notes}</p>
              </div>
            </div>
          )}

          {prescription.medicines && prescription.medicines.length > 0 && (
            <div>
              <h4 className="font-bold text-lg mb-4 text-[var(--color-theme-primary)]">Prescribed Medicines</h4>
              <div className="space-y-3">
                {prescription.medicines.map((med, idx) => (
                  <div key={idx} className="bg-[var(--color-theme-dropdown)] p-4 rounded-xl border border-[var(--color-theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-lg">{med.name}</h5>
                      <p className="text-sm text-[var(--color-theme-muted)] mt-1">{med.dosage}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="inline-block px-3 py-1 bg-neutral-800 rounded-lg text-sm border border-neutral-700">{med.frequency}</span>
                      <p className="text-sm text-[var(--color-theme-muted)] mt-2">For {med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prescription.file?.url && (
            <div>
              <h4 className="font-bold text-lg mb-2 text-[var(--color-theme-primary)]">Attached Document</h4>
              <a href={prescription.file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-[var(--color-theme-dropdown)] hover:bg-neutral-800 border border-[var(--color-theme-border)] rounded-xl transition">
                <span>📄</span> View Original Prescription File
              </a>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--color-theme-border)] bg-[var(--color-theme-panel)] flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-white rounded-lg font-medium transition">
             Done
           </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};


const Prescriptions = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/prescriptions/patient`, config);
        setPrescriptions(data);
      } catch (error) {
        console.error(error);
        // Do not treat 404 (empty results) as an error for toasts
        if (!error.response || error.response.status !== 404) {
          toast.error('Failed to load prescriptions');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[var(--color-theme-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">My Prescriptions</h1>
        <p className="text-[var(--color-theme-muted)] mt-2">View and manage all your medical prescriptions.</p>
      </div>

      {prescriptions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Empty State Hero */}
          <div className="glass-panel p-12 text-center rounded-2xl border border-[var(--color-theme-border)]">
            <div className="w-20 h-20 bg-[var(--color-theme-dropdown)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-theme-border)]">
              <span className="text-4xl">📄</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Prescriptions Yet</h2>
            <p className="text-[var(--color-theme-muted)] max-w-lg mx-auto leading-relaxed">
              You don’t have any prescriptions yet. Consult a specialist to receive personalized treatment recommendations and medications.
            </p>
          </div>

          {/* Educational Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-center text-[var(--color-theme-text)]">Treatment & Care Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Medicines', icon: '💊', desc: 'Prescription medications commonly used for hair loss treatment.', examples: ['Minoxidil', 'Finasteride', 'Dutasteride'] },
                { title: 'Supplements', icon: '🌿', desc: 'Nutritional supplements often recommended to support healthy hair growth.', examples: ['Biotin', 'Zinc', 'Iron', 'Vitamin D'] },
                { title: 'Hair Serums', icon: '💧', desc: 'Topical formulations used to strengthen follicles and improve hair density.', examples: ['Growth Serums', 'Scalp Serums'] },
                { title: 'Shampoos', icon: '🧴', desc: 'Products designed to maintain scalp health and reduce hair-related issues.', examples: ['Anti-Dandruff', 'Anti-Hairfall', 'Medicated'] },
                { title: 'Scalp Treatments', icon: '🏥', desc: 'Professional procedures used to improve scalp condition and hair growth.', examples: ['PRP Therapy', 'Mesotherapy', 'Scalp Therapy'] },
                { title: 'Lifestyle Recommendations', icon: '🧘', desc: 'Essential habits that support long-term hair health.', examples: ['Stress Management', 'Healthy Diet', 'Proper Sleep', 'Hydration'] }
              ].map((item, idx) => (
                <div key={idx} className="bg-[var(--color-theme-panel)] p-6 rounded-xl border border-[var(--color-theme-border)] hover:border-[var(--color-theme-primary)] transition group flex flex-col h-full shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <h4 className="font-semibold text-lg text-[var(--color-theme-text)]">{item.title}</h4>
                  </div>
                  <p className="text-sm text-[var(--color-theme-muted)] mb-5 flex-1 leading-relaxed">{item.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {item.examples.map((ex, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-[var(--color-theme-dropdown)] rounded-md border border-[var(--color-theme-border)] text-[var(--color-theme-muted)]">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-8 mt-12">
            <h3 className="text-xl font-bold mb-3">Need Professional Guidance?</h3>
            <p className="text-[var(--color-theme-muted)] mb-8 max-w-md mx-auto">Consult a qualified specialist for a personalized treatment plan.</p>
            <Link to="/patient/explore" className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-xl font-bold text-lg shadow-lg shadow-[var(--color-theme-primary)]/20 transition hover:-translate-y-1">
              Explore Doctors
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <motion.div
              key={prescription._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-theme-panel)] p-6 rounded-xl border border-[var(--color-theme-border)] hover:border-[var(--color-theme-primary)]/50 transition flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="flex gap-4 items-center">
                 <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center text-2xl border border-[var(--color-theme-border)] flex-shrink-0">
                    📄
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-[var(--color-theme-text)]">Dr. {prescription.doctor?.name}</h3>
                   <p className="text-sm text-[var(--color-theme-primary)] font-medium mb-1">
                     {prescription.appointment?.mode === 'online' ? 'Online Consultation' : 'In-Person Consultation'}
                   </p>
                   <p className="text-xs text-[var(--color-theme-muted)]">
                     Date: {new Date(prescription.createdAt).toLocaleDateString()}
                   </p>
                 </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                {prescription.file?.url && (
                  <a 
                    href={prescription.file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none text-center px-4 py-2 bg-[var(--color-theme-dropdown)] hover:bg-neutral-800 border border-[var(--color-theme-border)] rounded-lg text-sm font-medium transition"
                  >
                    Download
                  </a>
                )}
                <button 
                  onClick={() => setSelectedPrescription(prescription)}
                  className="flex-1 md:flex-none px-4 py-2 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-lg text-sm font-medium transition"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
         {selectedPrescription && (
           <PrescriptionModal 
             isOpen={true} 
             onClose={() => setSelectedPrescription(null)} 
             prescription={selectedPrescription} 
           />
         )}
      </AnimatePresence>
    </div>
  );
};

export default Prescriptions;
