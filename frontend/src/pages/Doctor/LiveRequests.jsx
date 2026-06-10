import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const LiveRequests = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [liveRequests, setLiveRequests] = useState([]);

  useEffect(() => {
    fetchInitialRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_request', (request) => {
      toast.info('New consultation request matched!', { theme: 'dark' });
      setLiveRequests(prev => [request, ...prev]);
    });

    socket.on('request_accepted', ({ requestId, acceptedBy }) => {
      if (acceptedBy !== user._id) {
        setLiveRequests(prev => prev.filter(r => r._id !== requestId));
        toast.warning('A request was accepted by another doctor.', { theme: 'dark' });
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
      setLiveRequests(prev => prev.filter(r => r._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">Live Requests</h1>
          <p className="text-[var(--color-theme-muted)] mt-2">Incoming patient requests matching your location and fee.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {liveRequests.map(req => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-primary)]/30 shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_var(--color-theme-primary)] transition duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-[var(--color-theme-text)]">{req.patient?.name || 'Anonymous'}</h3>
                  <p className="text-[var(--color-theme-muted)] mt-2 line-clamp-2">{req.problemDescription}</p>
                </div>
                <span className="px-3 py-1 bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] rounded-lg text-sm text-[var(--color-theme-primary)] capitalize">{req.mode}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-[var(--color-theme-muted)] mb-4 mt-4 p-4 bg-[var(--color-theme-from)]/10 rounded-xl">
                <div>
                  <span className="block opacity-70 mb-1">Timing</span>
                  <span className="font-medium text-[var(--color-theme-text)]">{req.preferredTiming}</span>
                </div>
                <div>
                  <span className="block opacity-70 mb-1">Budget Range</span>
                  <span className="font-medium text-[var(--color-theme-text)]">₹{req.budgetRange?.min} - ₹{req.budgetRange?.max}</span>
                </div>
              </div>

              {(req.previousPrescription?.url || (req.hairMedia && req.hairMedia.length > 0)) && (
                <div className="mb-6 space-y-4 border-t border-[var(--color-theme-border)] pt-4 text-[var(--color-theme-text)]">
                  {req.previousPrescription?.url && (
                    <div>
                      <span className="block opacity-70 mb-2 text-sm text-[var(--color-theme-muted)]">Previous Prescription</span>
                      <a
                        href={req.previousPrescription.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-4 py-2 bg-[var(--color-theme-from)]/20 text-[var(--color-theme-primary)] rounded-lg text-sm font-medium hover:bg-[var(--color-theme-from)]/40 transition border border-[var(--color-theme-border)]"
                      >
                        📄 View Prescription
                      </a>
                    </div>
                  )}

                  {req.hairMedia && req.hairMedia.length > 0 && (
                    <div>
                      <span className="block opacity-70 mb-2 text-sm text-[var(--color-theme-muted)]">Patient Media ({req.hairMedia.length})</span>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {req.hairMedia.map((media, idx) => (
                          <div key={idx} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-[var(--color-theme-border)] bg-[var(--color-theme-panel)]">
                            {media.resource_type === 'video' ? (
                              <video src={media.url} className="w-full h-full object-cover" controls preload="metadata" />
                            ) : (
                              <a href={media.url} target="_blank" rel="noreferrer">
                                <img src={media.url} className="w-full h-full object-cover hover:scale-110 transition cursor-pointer" alt="Patient media" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => handleAccept(req._id)}
                className="w-full bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] py-3 rounded-xl font-bold transition shadow-lg shadow-[var(--color-theme-primary)]/20"
              >
                Accept Patient
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {liveRequests.length === 0 && (
          <div className="col-span-full glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-theme-border)]">
            <div className="relative flex h-16 w-16 mb-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-theme-primary)] opacity-20"></span>
              <div className="relative rounded-full h-16 w-16 bg-[var(--color-theme-panel)] flex items-center justify-center text-2xl">📡</div>
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-theme-text)]">Listening for requests...</h3>
            <p className="text-[var(--color-theme-muted)] mt-2 max-w-md">No active requests matching your profile right now. New requests will appear here instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRequests;
