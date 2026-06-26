import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';
import { theme } from '../../utils/theme';

const PatientHome = () => {
  const { user } = useContext(AuthContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const [stats, setStats] = useState({ activeRequests: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        startLoading('Loading your dashboard...');
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/consultations/myrequests`, config);
        const active = data.filter(r => r.status === 'pending').length;
        setStats({ activeRequests: active, appointments: data.length - active });
      } catch (error) {
        console.error(error);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
        stopLoading();
      }
    };
    fetchStats();
  }, [user.token]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-panel p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Welcome back, <span className="text-primary">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your hair treatment journey and upcoming consultations from here.
        </p>
        <div className="mt-6 flex gap-4 flex-wrap">
          <Link to="/patient/explore" className={`px-6 py-3 rounded-xl font-semibold transition shadow-lg ${theme.buttonPrimary}`}>
            Find Doctors
          </Link>
          <Link to="/patient/request" className="px-6 py-3 glass-panel text-foreground rounded-xl font-semibold hover:bg-primary hover:bg-opacity-20 transition">
            Raise Request
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonLoader type="dashboard-stat" />
            <SkeletonLoader type="dashboard-stat" />
            <SkeletonLoader type="dashboard-stat" />
          </>
        ) : error ? (
          <div className="col-span-full glass-panel p-6 rounded-2xl text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-foreground rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium">Active Requests</h3>
              <p className="text-4xl font-bold mt-4 text-foreground">{stats.activeRequests}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium">Upcoming Appointments</h3>
              <p className="text-4xl font-bold mt-4 text-primary">{stats.appointments}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium">Prescriptions</h3>
              <p className="text-4xl font-bold mt-4 text-foreground">0</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-muted-foreground">No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
