import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { toast } from 'react-toastify';
import { DoctorCardSkeleton } from '../../components/SkeletonLoaders';

const ExploreDoctors = () => {
  const { user } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">Explore Doctors</h1>
          <p className="text-[var(--color-theme-muted)] mt-2">Find the best hair treatment specialists for you.</p>
        </div>
        <div className="flex gap-2">
           <select className="glass-panel text-sm px-3 py-2 rounded-lg text-[var(--color-theme-text)] outline-none">
              <option value="all" className="bg-slate-800">All Specialties</option>
              <option value="transplant" className="bg-slate-800">Hair Transplant</option>
              <option value="prp" className="bg-slate-800">PRP Therapy</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </div>
      ) : error ? (
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-theme-border)]">
          <div className="w-16 h-16 rounded-full bg-[var(--color-theme-panel)] flex items-center justify-center mb-4 text-2xl">⚠️</div>
          <h3 className="text-xl font-semibold text-[var(--color-theme-text)]">Error Loading Doctors</h3>
          <p className="text-[var(--color-theme-muted)] mt-2 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[var(--color-theme-primary)] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--color-theme-border)]">
          <div className="w-16 h-16 rounded-full bg-[var(--color-theme-panel)] flex items-center justify-center mb-4 text-2xl">👨‍⚕️</div>
          <h3 className="text-xl font-semibold text-[var(--color-theme-text)]">No doctors are currently available.</h3>
          <p className="text-[var(--color-theme-muted)] mt-2 max-w-md">Our network is expanding. Please check back later or raise a request to be notified when a specialist joins near you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <div key={doc._id} className="glass-panel p-6 rounded-2xl hover:border-[var(--color-theme-primary)] transition border border-[var(--color-theme-border)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex-shrink-0"></div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-theme-text)]">Dr. {doc.user?.name}</h3>
                  <p className="text-sm text-[var(--color-theme-primary)]">{doc.qualification}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-[var(--color-theme-muted)] mb-6">
                <p>📍 {doc.clinicLocation}</p>
                <p>⭐ {doc.experience} Years Exp.</p>
                <p>💰 ₹{doc.feeRange?.min} - ₹{doc.feeRange?.max} / visit</p>
              </div>
              <button className="w-full py-2 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-white rounded-lg font-medium transition">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreDoctors;
