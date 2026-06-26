import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';

const DoctorHome = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ requests: 0, appointments: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock stats based on live requests for now
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/consultations/live`, config);
        setStats({ requests: data.length, appointments: 0, earnings: 0 });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-panel p-8 rounded-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Welcome back, <span className="text-primary">Dr. {user?.name}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Here is your clinic overview for today.
            </p>
          </div>
          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border border-border">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            <span className="text-sm font-medium text-foreground">Available</span>
          </div>
        </div>
        <div className="mt-6 flex gap-4 flex-wrap">
          <Link to="/doctor/requests" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg flex items-center gap-2">
            View Live Requests <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-sm">{stats.requests}</span>
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
        ) : (
          <>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium">Pending Requests</h3>
              <p className="text-4xl font-bold mt-4 text-foreground">{stats.requests}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium">Today's Appointments</h3>
              <p className="text-4xl font-bold mt-4 text-primary">{stats.appointments}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <h3 className="text-muted-foreground font-medium">Total Earnings</h3>
              <p className="text-4xl font-bold mt-4 text-foreground">₹ {stats.earnings}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
