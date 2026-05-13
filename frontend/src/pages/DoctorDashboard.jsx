import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('live');
  const [liveRequests, setLiveRequests] = useState([]);

  useEffect(() => {
    fetchInitialRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_request', (request) => {
      toast.info('New consultation request matched!');
      setLiveRequests(prev => [request, ...prev]);
    });

    socket.on('request_accepted', ({ requestId, acceptedBy }) => {
      if (acceptedBy !== user._id) {
        setLiveRequests(prev => prev.filter(r => r._id !== requestId));
        toast.warning('A request was just accepted by another doctor.');
      }
    });

    return () => {
      socket.off('new_request');
      socket.off('request_accepted');
    };
  }, [socket, user._id]);

  const fetchInitialRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations/live`, config);
      setLiveRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations/${id}/accept`, {}, config);
      toast.success('Request accepted successfully!');
      setLiveRequests(prev => prev.filter(r => r._id !== id));
      // Switch to appointments tab (to be implemented)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
      // If failed due to someone else accepting it, remove from UI
      setLiveRequests(prev => prev.filter(r => r._id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-6 border-r border-slate-700 hidden md:block">
        <h2 className="text-2xl font-bold text-blue-400 mb-8">Doctor Panel</h2>
        <ul className="space-y-4 text-slate-300">
          <li className={`cursor-pointer hover:text-white ${activeTab === 'live' && 'text-blue-400 font-semibold'}`} onClick={() => setActiveTab('live')}>Live Requests</li>
          <li className={`cursor-pointer hover:text-white ${activeTab === 'appointments' && 'text-blue-400 font-semibold'}`} onClick={() => setActiveTab('appointments')}>Appointments</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, Dr. {user.name}</h1>

        {activeTab === 'live' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-slate-300 flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Incoming Live Requests
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveRequests.map(req => (
                <div key={req._id} className="bg-slate-800 p-6 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-emerald-400">Patient: {req.patient?.name || 'Anonymous'}</h3>
                      <p className="text-slate-400 mt-1">{req.problemDescription}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 rounded-lg text-sm">{req.mode}</span>
                  </div>
                  <div className="text-sm text-slate-400 mb-6 space-y-1">
                    <p>Timing: {req.preferredTiming}</p>
                    <p>Budget: ${req.budgetRange?.min} - ${req.budgetRange?.max}</p>
                  </div>
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
                  >
                    Accept Request
                  </button>
                </div>
              ))}
              {liveRequests.length === 0 && (
                <p className="text-slate-400 col-span-2 text-center py-12">No active requests matching your profile right now. Waiting for new patients...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="text-slate-400">Appointment view coming soon...</div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
