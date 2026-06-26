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
        className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden text-foreground max-h-[90vh] flex flex-col relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10 p-2">✕</button>

        <div className="p-6 border-b border-border bg-popover">
          <h2 className="text-2xl font-bold">Prescription Details</h2>
          <p className="text-muted-foreground mt-1">Prescribed on {new Date(prescription.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 border-2 border-primary">
              {prescription.doctor?.profileImage ? (
                <img src={prescription.doctor.profileImage} alt="Doctor" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">👨‍⚕️</div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-xl">Dr. {prescription.doctor?.name}</h3>
              <p className="text-muted-foreground">{prescription.appointment?.mode === 'online' ? 'Online Consultation' : 'In-Person Consultation'}</p>
            </div>
          </div>

          {prescription.notes && (
            <div>
              <h4 className="font-bold text-lg mb-2 text-primary">Doctor's Notes</h4>
              <div className="bg-popover p-4 rounded-xl border border-border">
                <p className="text-muted-foreground whitespace-pre-wrap">{prescription.notes}</p>
              </div>
            </div>
          )}

          {prescription.medicines && prescription.medicines.length > 0 && (
            <div>
              <h4 className="font-bold text-lg mb-4 text-primary">Prescribed Medicines</h4>
              <div className="space-y-3">
                {prescription.medicines.map((med, idx) => (
                  <div key={idx} className="bg-popover p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-lg">{med.name}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{med.dosage}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="inline-block px-3 py-1 bg-neutral-800 rounded-lg text-sm border border-neutral-700">{med.frequency}</span>
                      <p className="text-sm text-muted-foreground mt-2">For {med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prescription.file?.url && (
            <div>
              <h4 className="font-bold text-lg mb-2 text-primary">Attached Document</h4>
              <a href={prescription.file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-popover hover:bg-neutral-800 border border-border rounded-xl transition">
                <span>📄</span> View Original Prescription File
              </a>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition">
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
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/prescriptions/patient`, config);
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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Prescriptions</h1>
        <p className="text-muted-foreground mt-2">View and manage all your medical prescriptions.</p>
      </div>

      {prescriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Empty State Hero */}
          <div className="glass-panel p-12 text-center rounded-2xl border border-border">
            <div className="w-20 h-20 bg-popover rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
              <span className="text-4xl">📄</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Prescriptions Yet</h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              You don’t have any prescriptions yet. Consult a specialist to receive personalized treatment recommendations and medications.
            </p>
          </div>

          {/* Educational Section */}
          <div className="pt-4">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-foreground mb-2">Most Common Hair Problems & Treatments</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">Learn about commonly used medicines, cosmetics, and treatment approaches for different hair concerns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Hair Fall', icon: '🍂',
                  medicines: ['Minoxidil', 'Finasteride'],
                  cosmetics: ['Anti Hair Fall Shampoo', 'Hair Growth Serum'],
                  lifestyle: ['Reduce stress', 'Protein-rich diet']
                },
                {
                  title: 'Dandruff', icon: '❄️',
                  medicines: ['Ketoconazole', 'Selenium Sulfide'],
                  cosmetics: ['Anti-Dandruff Shampoo', 'Scalp Cleanser'],
                  lifestyle: ['Regular scalp hygiene', 'Avoid excessive oil buildup']
                },
                {
                  title: 'Alopecia', icon: '👨‍🦲',
                  medicines: ['Minoxidil', 'Corticosteroids'],
                  cosmetics: ['Hair Thickening Products'],
                  lifestyle: ['Early specialist consultation', 'Consistent treatment']
                },
                {
                  title: 'Hair Thinning', icon: '📉',
                  medicines: ['Minoxidil', 'Biotin Supplements'],
                  cosmetics: ['Volumizing Shampoo', 'Hair Density Serum'],
                  lifestyle: ['Improve nutrition', 'Reduce heat styling']
                },
                {
                  title: 'Premature Greying', icon: '🦳',
                  medicines: ['Vitamin B12 Supplements', 'Iron Supplements'],
                  cosmetics: ['Hair Nourishing Oils', 'Grey Hair Care Products'],
                  lifestyle: ['Healthy diet', 'Stress management']
                },
                {
                  title: 'Scalp Irritation', icon: '🔥',
                  medicines: ['Anti-inflammatory treatments', 'Medicated shampoos'],
                  cosmetics: ['Sensitive Scalp Shampoo', 'Soothing Scalp Serum'],
                  lifestyle: ['Avoid harsh chemicals', 'Maintain scalp hydration']
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors group flex flex-col h-full shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl group-hover:scale-110 transition-transform origin-bottom-left">{item.icon}</span>
                    <h4 className="font-bold text-xl text-foreground">{item.title}</h4>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div>
                      <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2"><span>💊</span> Common Medicines</h5>
                      <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
                        {item.medicines.map((m, i) => <li key={i} className="flex items-start gap-2"><span className="text-primary opacity-50">•</span> {m}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2"><span>🧴</span> Common Cosmetics</h5>
                      <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
                        {item.cosmetics.map((c, i) => <li key={i} className="flex items-start gap-2"><span className="text-blue-400 opacity-50">•</span> {c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2"><span>🧘</span> Lifestyle Tips</h5>
                      <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
                        {item.lifestyle.map((l, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-400 opacity-50">•</span> {l}</li>)}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center max-w-3xl mx-auto">
              <p className="text-sm text-yellow-500/90 flex items-center justify-center gap-2">
                <span className="text-lg">⚠️</span>
                <span><span className="font-bold text-yellow-500">Disclaimer:</span> The medicines and products shown are for educational purposes only and should not be used without professional medical advice.</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-8 mt-16">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="max-w-2xl mx-auto bg-gradient-to-br from-[var(--color-theme-panel)] to-[var(--color-theme-dropdown)] p-10 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/5"
            >
              <h3 className="text-2xl font-bold mb-3 text-foreground">Need Personalized Treatment?</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">Every hair condition is unique. Consult a qualified specialist to receive a treatment plan tailored to your needs.</p>
              <Link to="/patient/explore" className="inline-flex items-center justify-center px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition hover:-translate-y-1 w-full sm:w-auto">
                Explore Doctors
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <motion.div
              key={prescription._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center text-2xl border border-border flex-shrink-0">
                  📄
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Dr. {prescription.doctor?.name}</h3>
                  <p className="text-sm text-primary font-medium mb-1">
                    {prescription.appointment?.mode === 'online' ? 'Online Consultation' : 'In-Person Consultation'}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
                    className="flex-1 md:flex-none text-center px-4 py-2 bg-popover hover:bg-neutral-800 border border-border rounded-lg text-sm font-medium transition"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={() => setSelectedPrescription(prescription)}
                  className="flex-1 md:flex-none px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition"
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
