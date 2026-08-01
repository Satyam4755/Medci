import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, FileText, User as UserIcon } from 'lucide-react';

const AdminVerification = () => {
  const { user } = useContext(AuthContext);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/admin/verification/pending`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPendingDoctors(data);
    } catch (error) {
      toast.error('Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [user]);

  const handleReview = async (doctorId, status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/admin/verification/review/${doctorId}`,
        { status, rejectionReason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Doctor ${status} successfully`);
      setSelectedDoctor(null);
      setRejectionReason('');
      fetchPending();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing review');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading pending verifications...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Pending Verifications</h1>
      
      {pendingDoctors.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-muted-foreground">
          No pending verifications to review.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List panel */}
          <div className="col-span-1 glass-panel p-4 rounded-2xl max-h-[800px] overflow-y-auto">
            {pendingDoctors.map(doctor => (
              <div 
                key={doctor._id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`p-4 rounded-xl cursor-pointer transition border mb-3 ${selectedDoctor?._id === doctor._id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-full"><UserIcon size={24} /></div>
                  <div>
                    <h4 className="font-bold text-foreground">{doctor.name}</h4>
                    <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    <p className="text-xs text-primary mt-1">Submitted: {new Date(doctor.profile.verification.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel */}
          {selectedDoctor && (
            <div className="col-span-2 glass-panel p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">Review: Dr. {selectedDoctor.name}</h2>
              
              {/* OCR Data */}
              {selectedDoctor.profile.verification.ocrData && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-6">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2"><FileText size={18} /> AI Extracted Data</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name on Doc:</p>
                      <p className="font-medium text-foreground">{selectedDoctor.profile.verification.ocrData.structured?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reg No:</p>
                      <p className="font-medium text-foreground">{selectedDoctor.profile.verification.ocrData.structured?.registrationNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Links */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-foreground">Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedDoctor.profile.verification.documents || {}).map(([key, url]) => (
                    url ? (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="p-3 border border-border rounded-lg flex flex-col hover:bg-muted/50 transition">
                        <span className="capitalize font-medium mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs text-primary underline truncate">View Document</span>
                      </a>
                    ) : null
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-2">Decision</h3>
                <div className="flex gap-4">
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleReview(selectedDoctor._id, 'verified')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle size={20} /> Approve Verification
                  </button>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm text-muted-foreground mb-2">Rejection Reason (if rejecting)</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 mb-3 focus:outline-none focus:border-red-500"
                    placeholder="E.g., Image is blurry, name mismatch..."
                    rows={3}
                  />
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleReview(selectedDoctor._id, 'rejected')}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold transition border border-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={20} /> Reject Verification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
