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
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [preferredTiming, setPreferredTiming] = useState('');
  const [mode, setMode] = useState('online');
  const [radius, setRadius] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    startLoading('Broadcasting your request...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        problemDescription,
        budgetRange: { min: Number(budgetMin), max: Number(budgetMax) },
        preferredTiming,
        mode,
        distancePreference: Number(radius),
        longitude: 77.2090,
        latitude: 28.6139
      };

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations`, payload, config);
      toast.success('Consultation request broadcasted successfully!');
      navigate('/patient/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-[var(--color-theme-text)]">Raise a Consultation Request</h1>
      <p className="text-[var(--color-theme-muted)] mb-8">Fill in your details, and we'll instantly notify matching doctors in your area.</p>

      <div className="glass-panel p-8 rounded-2xl border border-[var(--color-theme-border)]">
        <form onSubmit={submitRequest} className="space-y-6">
          <div>
            <label className="block font-medium text-[var(--color-theme-muted)] mb-2">Problem Description</label>
            <textarea
              required
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="E.g., Experiencing severe hair fall for the last 3 months..."
              className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              rows="4"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-[var(--color-theme-muted)] mb-2">Budget Min (₹)</label>
              <input
                type="number"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                disabled={isSubmitting}
                placeholder="₹ 500"
                className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium text-[var(--color-theme-muted)] mb-2">Budget Max (₹)</label>
              <input
                type="number"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                disabled={isSubmitting}
                placeholder="₹ 2000"
                className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[var(--color-theme-muted)] mb-2">Preferred Timing</label>
            <input
              type="text"
              placeholder="e.g., Tomorrow morning or Weekends"
              required
              value={preferredTiming}
              onChange={(e) => setPreferredTiming(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-[var(--color-theme-muted)] mb-2">Consultation Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="online" className="bg-slate-800">Online</option>
                <option value="offline" className="bg-slate-800">Offline (Clinic Visit)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[var(--color-theme-muted)] mb-2">Search Radius</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-theme-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={0} className="bg-slate-800">Any Location</option>
                <option value={10} className="bg-slate-800">Within 10 km</option>
                <option value={25} className="bg-slate-800">Within 25 km</option>
                <option value={50} className="bg-slate-800">Within 50 km</option>
                <option value={100} className="bg-slate-800">Within 100 km</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] disabled:bg-[var(--color-theme-primary)] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition mt-8 shadow-lg flex items-center justify-center"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
              />
            ) : null}
            {isSubmitting ? 'Broadcasting...' : 'Broadcast Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseRequest;
