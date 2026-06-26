import React, { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);

  const { sendDeleteOtp, verifyDeleteOtp, deleteAccount, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp(['', '', '', '', '', '']);
      setTimer(0);
    }
  }, [isOpen]);

  // Manage body scroll and ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isSubmitting && step !== 3) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isSubmitting, step, onClose]);

  useEffect(() => {
    let interval;
    if (timer > 0 && step === 2) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleSendOtp = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await sendDeleteOtp();
      toast.success('Verification code sent to your email');
      setStep(2);
      setTimer(60);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await verifyDeleteOtp(otpString);
      toast.success('OTP verified');
      setStep(3);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteAccount();
      toast.success('Your account has been permanently deleted');
      onClose();
      logout();
      navigate('/');
    } catch (error) {
      toast.error(error);
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && step !== 3) {
          onClose();
        }
      }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden text-foreground relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          disabled={isSubmitting || step === 3}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground disabled:opacity-50 z-10 p-2"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-destructive dark:text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-center">Delete Account</h2>
                <p className="text-center text-muted-foreground mb-8">
                  Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-background hover:bg-[var(--color-theme-border)] rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-destructive hover:bg-destructive/90 text-primary-foreground rounded-lg font-medium transition flex justify-center items-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Send OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-2xl font-bold mb-2 text-center text-destructive">Security Verification</h2>
                <p className="text-center text-muted-foreground mb-6">
                  Enter the 6-digit verification code sent to your email.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center gap-1 sm:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={isSubmitting}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-background border border-red-500/30 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50 shrink-0"
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.join('').length !== 6}
                    className="w-full bg-destructive hover:bg-destructive/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 rounded-lg transition flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Verify to Delete'}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSendOtp}
                    disabled={timer > 0 || isSubmitting}
                    className="text-muted-foreground hover:text-foreground font-medium text-sm transition disabled:opacity-50"
                  >
                    {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-border rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold mb-2">Deleting Account...</h2>
                <p className="text-muted-foreground text-sm">Please do not close this window.</p>
                {/* Auto trigger deletion once verified */}
                {(() => {
                  if (!isSubmitting) handleDelete();
                  return null;
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteAccountModal;
