import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PatientHome = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ activeRequests: 0, appointments: 0 });

  useEffect(() => {
    // In a real app, fetch these from an API
    // For now, let's mock the stats based on local requests
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations/myrequests`, config);
        const active = data.filter(r => r.status === 'pending').length;
        setStats({ activeRequests: active, appointments: data.length - active });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-panel p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-theme-text)]">
          Welcome back, <span className="text-[var(--color-theme-primary)]">{user?.name}</span>
        </h1>
        <p className="text-[var(--color-theme-muted)] text-lg">
          Manage your hair treatment journey and upcoming consultations from here.
        </p>
        <div className="mt-6 flex gap-4 flex-wrap">
          <Link to="/patient/explore" className="px-6 py-3 bg-[var(--color-theme-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-theme-primary-hover)] transition shadow-lg">
            Find Doctors
          </Link>
          <Link to="/patient/request" className="px-6 py-3 glass-panel text-[var(--color-theme-text)] rounded-xl font-semibold hover:bg-[var(--color-theme-primary)] hover:bg-opacity-20 transition">
            Raise Request
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-[var(--color-theme-muted)] font-medium">Active Requests</h3>
          <p className="text-4xl font-bold mt-4 text-[var(--color-theme-text)]">{stats.activeRequests}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-[var(--color-theme-muted)] font-medium">Upcoming Appointments</h3>
          <p className="text-4xl font-bold mt-4 text-[var(--color-theme-primary)]">{stats.appointments}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-[var(--color-theme-muted)] font-medium">Prescriptions</h3>
          <p className="text-4xl font-bold mt-4 text-[var(--color-theme-text)]">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-theme-text)]">Recent Activity</h2>
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-[var(--color-theme-muted)]">No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
