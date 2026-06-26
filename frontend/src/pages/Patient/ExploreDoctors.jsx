import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { toast } from 'react-toastify';
import SkeletonLoader from '../../components/SkeletonLoader';
import DoctorProfilePreviewModal from '../../components/DoctorProfilePreviewModal';

const ExploreDoctors = () => {
  const { user } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setError(null);
        startLoading('Finding doctors...');
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/doctors`, config);
        setDoctors(data);
        setLoading(false);
        stopLoading();
      } catch (error) {
        console.error(error);
        setError('Failed to load doctors. Please try again.');
        setLoading(false);
        stopLoading();
        toast.error('Failed to load doctors');
      }
    };
    fetchDoctors();
  }, [user.token]); // Only depend on user.token

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Explore Doctors</h1>
          <p className="text-muted-foreground mt-2">Find the best hair treatment specialists for you.</p>
        </div>
        <div className="flex w-full md:w-auto">
           <select className="glass-panel text-sm px-3 py-3 w-full md:w-auto rounded-lg text-foreground outline-none">
              <option value="all" className="bg-popover text-foreground">All Specialties</option>
              <option value="transplant" className="bg-popover text-foreground">Hair Transplant</option>
              <option value="prp" className="bg-popover text-foreground">PRP Therapy</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <SkeletonLoader key={i} type="card" />)}
        </div>
      ) : error ? (
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border-dashed border-2 border-border">
          <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 text-2xl">⚠️</div>
          <h3 className="text-xl font-semibold text-foreground">Error Loading Doctors</h3>
          <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border-dashed border-2 border-border">
          <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 text-2xl">👨‍⚕️</div>
          <h3 className="text-xl font-semibold text-foreground">No doctors are currently available.</h3>
          <p className="text-muted-foreground mt-2 max-w-md">Our network is expanding. Please check back later or raise a request to be notified when a specialist joins near you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <div key={doc._id} className="glass-panel p-6 rounded-2xl hover:border-primary transition border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex-shrink-0 overflow-hidden flex items-center justify-center border-2 border-primary">
                  {doc.user?.profileImage ? (
                    <img src={doc.user.profileImage} alt={`Dr. ${doc.user?.name}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-muted-foreground">?</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Dr. {doc.user?.name}</h3>
                  <p className="text-sm text-primary">{doc.qualification}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>📍 {doc.clinicLocation}</p>
                <p>⭐ {doc.experience} Years Exp.</p>
                <p>💰 ₹{doc.feeRange?.min} - ₹{doc.feeRange?.max} / visit</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedDoctorId(doc._id);
                  setIsProfileModalOpen(true);
                }}
                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      <DoctorProfilePreviewModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        doctorId={selectedDoctorId} 
      />
    </div>
  );
};

export default ExploreDoctors;
