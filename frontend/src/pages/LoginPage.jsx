import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useGlobalLoading } from '../context/GlobalLoadingContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { theme } from '../utils/theme';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    startLoading('Signing you in...');

    try {
      const data = await login(email, password);
      toast.success('Logged in successfully');
      if (data.role === 'Doctor') navigate('/doctor');
      else if (data.role === 'Patient') navigate('/patient');
      else navigate('/');
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-theme-from)] text-[var(--color-theme-text)] p-6 relative">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--color-theme-panel)] p-8 rounded-2xl border border-[var(--color-theme-border)] shadow-xl z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[var(--color-theme-text)]">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-[var(--color-theme-muted)] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${theme.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 rounded-lg transition flex items-center justify-center`}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              'Log In'
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-[var(--color-theme-muted)]">
          Don't have an account? <Link to="/signup" className="text-[var(--color-theme-text)] font-medium hover:underline">Sign up</Link>
        </p>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)] transition flex items-center justify-center gap-2">
            <span>←</span> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
