import React, { useState, useRef, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Camera, Upload, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../utils/theme';

const DoctorVerification = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState({
    governmentId: null,
    medicalRegistration: null,
    qualificationCertificate: null,
    clinicProof: null,
  });
  
  // If user is already verified or under review, redirect
  useEffect(() => {
    if (user?.verificationStatus === 'verified') {
      navigate('/doctor');
    }
    if (user?.verificationStatus === 'under_review') {
      navigate('/doctor'); // Let the dashboard show the under review state
    }
  }, [user, navigate]);

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [docType]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documents.governmentId || !documents.medicalRegistration || !documents.qualificationCertificate) {
      toast.error('Please upload all required documents.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('governmentId', documents.governmentId);
      formData.append('medicalRegistration', documents.medicalRegistration);
      formData.append('qualificationCertificate', documents.qualificationCertificate);
      if (documents.clinicProof) {
        formData.append('clinicProof', documents.clinicProof);
      }

      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/doctors/verification/submit`, formData, config);
      
      // Update context user with new status
      const updatedUser = { ...user, verificationStatus: data.verificationStatus };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify({ ...JSON.parse(localStorage.getItem('userInfo')), verificationStatus: data.verificationStatus }));
      
      toast.success(data.message);
      setStep(4); // Success step
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadBox = (title, docType, isOptional = false) => (
    <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden transition-all hover:bg-muted/50">
      <input
        type="file"
        accept="image/jpeg, image/png, application/pdf"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => handleFileChange(e, docType)}
      />
      {documents[docType] ? (
        <div className="flex flex-col items-center text-primary">
          <CheckCircle size={32} className="mb-2" />
          <p className="font-medium text-foreground">{documents[docType].name}</p>
          <p className="text-xs text-muted-foreground mt-1">Tap to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-muted-foreground">
          <Upload size={32} className="mb-2" />
          <p className="font-medium text-foreground">{title} {isOptional && <span className="text-muted-foreground font-normal">(Optional)</span>}</p>
          <p className="text-xs mt-1 text-center">Tap to upload PDF, JPG, or PNG</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-background flex flex-col items-center justify-center p-4`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-card/80 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i}
              </div>
              {i < 3 && <div className={`flex-1 h-1 mx-2 rounded-full ${step > i ? 'bg-primary' : 'bg-muted'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Government & Identity</h2>
              <p className="text-muted-foreground mb-6">Please upload a valid government-issued ID to verify your identity.</p>
              
              <div className="space-y-4">
                {renderUploadBox('Government ID (Aadhaar/Passport/DL)', 'governmentId')}
              </div>
              
              <button
                onClick={() => {
                  if (!documents.governmentId) return toast.error('Government ID is required');
                  setStep(2);
                }}
                className="w-full mt-8 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Medical Credentials</h2>
              <p className="text-muted-foreground mb-6">Upload your professional qualifications.</p>
              
              <div className="space-y-4">
                {renderUploadBox('Medical Council Registration', 'medicalRegistration')}
                {renderUploadBox('MBBS / MD Degree', 'qualificationCertificate')}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setStep(1)} className="flex-1 border border-border py-3 rounded-xl font-bold hover:bg-muted transition-colors">Back</button>
                <button
                  onClick={() => {
                    if (!documents.medicalRegistration || !documents.qualificationCertificate) return toast.error('Both documents are required');
                    setStep(3);
                  }}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Clinic Details & Submission</h2>
              <p className="text-muted-foreground mb-6">Upload proof of your clinic or hospital association if applicable.</p>
              
              <div className="space-y-4">
                {renderUploadBox('Clinic Registration / Proof', 'clinicProof', true)}
              </div>

              <div className="bg-muted/50 p-4 rounded-xl mt-6 text-sm text-muted-foreground flex gap-3">
                <FileText className="flex-shrink-0 text-primary" size={20} />
                <p>By submitting, you agree that your documents will be scanned and reviewed by our administration team. This process typically takes 24-48 hours.</p>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setStep(2)} disabled={isSubmitting} className="flex-1 border border-border py-3 rounded-xl font-bold hover:bg-muted transition-colors disabled:opacity-50">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Documents Submitted</h2>
              <p className="text-muted-foreground mb-8">
                Your verification documents have been securely uploaded. Our AI scanning and manual review process has begun. You will be notified once approved.
              </p>
              <button
                onClick={() => navigate('/doctor')}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DoctorVerification;
