import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useGlobalLoading } from '../context/GlobalLoadingContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    startLoading('Creating your account...');

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
        <h2 className="text-3xl font-bold mb-6 text-center text-emerald-400">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition mt-4 flex items-center justify-center"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : null}
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400">
          Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
