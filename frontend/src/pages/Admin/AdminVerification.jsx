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
                      <p className="font-medium text-foreground">{selectedDoctor.profile.verification.extractedData?.doctorName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reg No:</p>
                      <p className="font-medium text-foreground">{selectedDoctor.profile.verification.extractedData?.registrationNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-muted-foreground">Degree:</p>
                      <p className="font-medium text-foreground">{selectedDoctor.profile.verification.extractedData?.degree || 'N/A'} from {selectedDoctor.profile.verification.extractedData?.university || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aadhaar:</p>
                      <p className="font-medium text-foreground">{selectedDoctor.profile.verification.extractedData?.aadhaarNumber || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Score & Issues */}
                  <div className="mt-6 border-t border-primary/20 pt-4">
                    <div className="flex items-center gap-4 mb-3">
                      <p className="text-sm font-semibold">Overall AI Score:</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedDoctor.profile.verification.overallScore >= 90 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {selectedDoctor.profile.verification.overallScore}%
                      </span>
                    </div>
                    {selectedDoctor.profile.verification.issues && selectedDoctor.profile.verification.issues.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                        <p className="text-xs font-bold text-red-500 mb-1">AI Warnings</p>
                        <ul className="list-disc list-inside text-xs text-red-400">
                          {selectedDoctor.profile.verification.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents Links */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-foreground">Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedDoctor.profile.verification.documents || {}).map(([key, url]) => {
                    if (!url) return null;
                    
                    // Format key for reading (e.g. medicalRegistration -> Medical Registration)
                    let displayKey = key;
                    if (key === 'governmentId') displayKey = 'Aadhaar';
                    else if (key === 'qualificationCertificate') displayKey = 'Qualification';
                    
                    // Match confidence key logic
                    const confKey = key === 'governmentId' ? 'aadhaar' 
                                  : key === 'qualificationCertificate' ? 'qualification' 
                                  : key;

                    const confidence = selectedDoctor.profile.verification.ocrConfidence?.[confKey] || 0;
                    const confidenceColor = confidence >= 90 ? 'text-green-500 bg-green-500/10' : (confidence >= 70 ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10');

                    return (
                      <div key={key} className="p-3 border border-border rounded-lg flex flex-col justify-between hover:bg-muted/50 transition relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="capitalize font-medium text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          {confidence > 0 && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${confidenceColor}`}>
                              {confidence}% Match
                            </span>
                          )}
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate">View Document</a>
                      </div>
                    );
                  })}
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
