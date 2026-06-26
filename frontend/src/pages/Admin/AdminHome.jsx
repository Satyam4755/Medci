import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminHome = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    activeRequests: 0,
    totalRevenue: 0,
    totalCommission: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/admin/stats`, config);
        setStats(data);
      } catch (error) {
        toast.error('Failed to load admin stats');
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 rounded-2xl flex justify-between items-center border border-primary/30 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Platform activity and revenue overview</p>
        </div>
        <div className="bg-primary/20 px-6 py-3 rounded-xl border border-primary">
          <span className="block text-sm text-muted-foreground uppercase tracking-wider">Total Commission</span>
          <span className="text-3xl font-bold text-primary">₹ {stats.totalCommission.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Patients</h3>
          <p className="text-4xl font-bold mt-3 text-foreground">{stats.totalUsers}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Doctors</h3>
          <p className="text-4xl font-bold mt-3 text-foreground">{stats.totalDoctors}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Active Consultations</h3>
          <p className="text-4xl font-bold mt-3 text-primary">{stats.activeRequests}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Revenue</h3>
          <p className="text-4xl font-bold mt-3 text-foreground">₹ {stats.totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-2xl border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Doctor Verification</h2>
          <div className="p-6 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground">
            <span className="text-2xl mb-2 block">📋</span>
            No pending verifications. All doctors are verified.
          </div>
        </div>
        <div className="glass-panel p-8 rounded-2xl border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-card rounded-xl">
              <span className="text-muted-foreground">Socket.IO Real-time Engine</span>
              <span className="text-foreground font-semibold px-3 py-1 bg-primary/20 rounded-full">Online</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-card rounded-xl">
              <span className="text-muted-foreground">MongoDB Database</span>
              <span className="text-foreground font-semibold px-3 py-1 bg-primary/20 rounded-full">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
