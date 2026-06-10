import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useGlobalLoading } from '../context/GlobalLoadingContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const { register, sendOtp, verifyOtp } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0 && step === 2) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting || !email) return;

    setIsSubmitting(true);
    try {
      await sendOtp(email);
      toast.success('Verification code sent to your email');
      setStep(2);
      setTimer(60); // 60 seconds cooldown for resend
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
      await verifyOtp(email, otpString);
      toast.success('Email verified successfully');
      setStep(3);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await register(name, email, password, role);
      toast.success('Account created successfully');
      if (data.role === 'Doctor') navigate('/doctor');
      else if (data.role === 'Patient') navigate('/patient');
      else navigate('/');
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-theme-from)] text-[var(--color-theme-text)] p-6 relative overflow-hidden">
      {/* Medci Logo Header */}
      <div className="absolute top-6 left-6 md:top-10 md:left-12">
        <Link to="/">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="text-3xl font-bold text-[var(--color-theme-text)] tracking-tight cursor-pointer"
          >
            Medci
          </motion.div>
        </Link>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--color-theme-panel)] p-8 rounded-2xl border border-[var(--color-theme-border)] shadow-xl z-10"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-3xl font-bold mb-2 text-center text-[var(--color-theme-text)]">Create Account</h2>
              <p className="text-center text-[var(--color-theme-muted)] mb-6">First, let's verify your email address</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[var(--color-theme-muted)] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition mt-4 flex items-center justify-center shadow-sm"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                    />
                  ) : null}
                  {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-3xl font-bold mb-2 text-center text-[var(--color-theme-text)]">Verify Email</h2>
              <p className="text-center text-[var(--color-theme-muted)] mb-6">
                Enter the 6-digit code sent to <br/><span className="font-semibold text-[var(--color-theme-text)]">{email}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-2">
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
                      className="w-12 h-14 text-center text-xl font-bold bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] rounded-lg focus:outline-none focus:border-[var(--color-theme-primary)] focus:ring-1 focus:ring-[var(--color-theme-primary)] disabled:opacity-50"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || otp.join('').length !== 6}
                  className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition flex items-center justify-center shadow-sm"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                    />
                  ) : null}
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-[var(--color-theme-muted)] text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={() => handleSendOtp()}
                  disabled={timer > 0 || isSubmitting}
                  className="text-[var(--color-theme-text)] font-medium hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-3xl font-bold mb-2 text-center text-[var(--color-theme-text)]">Complete Profile</h2>
              <p className="text-center text-[var(--color-theme-muted)] mb-6">Your email is verified. Let's finish setting up.</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[var(--color-theme-muted)] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-theme-muted)] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-theme-muted)] mb-1">I am a...</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition mt-4 flex items-center justify-center shadow-sm"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                    />
                  ) : null}
                  {isSubmitting ? 'Creating Account...' : 'Complete Sign Up'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <p className="mt-6 text-center text-[var(--color-theme-muted)]">
            Already have an account? <Link to="/login" className="text-[var(--color-theme-text)] font-medium hover:underline">Log in</Link>
          </p>
        )}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-neutral-500 hover:text-[var(--color-theme-text)] transition flex items-center justify-center gap-2">
            <span>←</span> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
