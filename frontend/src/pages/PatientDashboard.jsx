import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('create');

  // Form State
  const [problemDescription, setProblemDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [preferredTiming, setPreferredTiming] = useState('');
  const [mode, setMode] = useState('online');
  const [radius, setRadius] = useState(0); // 0 = Any

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchMyRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations/myrequests`, config);
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        problemDescription,
        budgetRange: { min: Number(budgetMin), max: Number(budgetMax) },
        preferredTiming,
        mode,
        distancePreference: Number(radius),
        longitude: 77.2090, // mock location
        latitude: 28.6139   // mock location
      };

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations`, payload, config);
      toast.success('Consultation request sent!');
      setActiveTab('requests');
      setProblemDescription('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-6 border-r border-slate-700 hidden md:block">
        <h2 className="text-2xl font-bold text-emerald-400 mb-8">Patient Panel</h2>
        <ul className="space-y-4 text-slate-300">
          <li className={`cursor-pointer hover:text-white ${activeTab === 'create' && 'text-emerald-400 font-semibold'}`} onClick={() => setActiveTab('create')}>New Request</li>
          <li className={`cursor-pointer hover:text-white ${activeTab === 'requests' && 'text-emerald-400 font-semibold'}`} onClick={() => setActiveTab('requests')}>My Requests</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>

        {activeTab === 'create' && (
          <div className="max-w-2xl bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Create Consultation Request</h2>
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Problem Description</label>
                <textarea
                  required value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" rows="3"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Budget Min ($)</label>
                  <input type="number" required value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Budget Max ($)</label>
                  <input type="number" required value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Preferred Timing</label>
                <input type="text" placeholder="e.g., Tomorrow morning" required value={preferredTiming} onChange={(e) => setPreferredTiming(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Mode</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Search Radius (km)</label>
                  <select value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2">
                    <option value={0}>Any Location</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold transition mt-4">
                Find Doctors
              </button>
            </form>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{req.problemDescription}</h3>
                  <p className="text-slate-400 text-sm">Mode: {req.mode} | Budget: ${req.budgetRange.min} - ${req.budgetRange.max}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {req.status.toUpperCase()}
                  </span>
                  {req.acceptedBy && <p className="text-sm text-slate-400 mt-2">Accepted by Dr. {req.acceptedBy.name}</p>}
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-slate-400">No requests found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
