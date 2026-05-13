import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useGlobalLoading } from '../context/GlobalLoadingContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              'Log In'
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400">
          Don't have an account? <Link to="/signup" className="text-blue-400 hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
