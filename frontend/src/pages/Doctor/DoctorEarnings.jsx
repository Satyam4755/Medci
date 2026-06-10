import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const DoctorEarnings = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    thisWeekEarnings: 0,
    completedConsultations: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/doctors/earnings`, config);
        setData(response.data);
      } catch (error) {
        console.error(error);
        if (!error.response || error.response.status !== 404) {
          toast.error('Failed to load earnings data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[var(--color-theme-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate some dummy chart data for visual purposes if they have earnings, normally this would come from the backend per month
  const chartData = [
    { name: 'Jan', earnings: data.totalEarnings * 0.1 },
    { name: 'Feb', earnings: data.totalEarnings * 0.15 },
    { name: 'Mar', earnings: data.totalEarnings * 0.2 },
    { name: 'Apr', earnings: data.totalEarnings * 0.1 },
    { name: 'May', earnings: data.totalEarnings * 0.25 },
    { name: 'Jun', earnings: data.thisMonthEarnings },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-theme-text)]">My Earnings</h1>
        <p className="text-[var(--color-theme-muted)] mt-2">Track your revenue and financial growth.</p>
      </div>

      {data.totalEarnings === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Empty State Hero */}
          <div className="glass-panel p-12 text-center rounded-2xl border border-[var(--color-theme-border)] bg-[var(--color-theme-panel)]/50">
            <div className="w-24 h-24 bg-[var(--color-theme-dropdown)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-theme-border)] shadow-inner">
              <span className="text-5xl">💰</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Earnings Yet</h2>
            <p className="text-[var(--color-theme-muted)] max-w-lg mx-auto leading-relaxed">
              Your earnings will appear here once you begin consulting patients. Manage your requests to start earning!
            </p>
          </div>

          {/* Estimated Growth Section */}
          <div>
            <h3 className="text-xl font-bold mb-2 text-center text-[var(--color-theme-text)]">Estimated Monthly Growth Potential</h3>
            <p className="text-sm text-[var(--color-theme-muted)] text-center mb-8">Assuming a standard consultation fee of ₹500/visit. This is for educational illustration only.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: '1 Consultation / Day', amount: '₹15,000', icon: '🌱', highlight: false },
                { title: '5 Consultations / Day', amount: '₹75,000', icon: '🌿', highlight: true },
                { title: '10 Consultations / Day', amount: '₹150,000', icon: '🌳', highlight: false }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5 }}
                  className={`p-6 rounded-2xl border transition-all text-center ${item.highlight ? 'bg-gradient-to-b from-[var(--color-theme-primary)]/20 to-[var(--color-theme-panel)] border-[var(--color-theme-primary)]/50 shadow-lg shadow-[var(--color-theme-primary)]/10' : 'bg-[var(--color-theme-panel)] border-[var(--color-theme-border)] hover:border-[var(--color-theme-primary)]/30'}`}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="font-medium text-[var(--color-theme-muted)] mb-2">{item.title}</h4>
                  <p className={`text-3xl font-bold ${item.highlight ? 'text-[var(--color-theme-primary)]' : 'text-[var(--color-theme-text)]'}`}>{item.amount}</p>
                  <p className="text-xs text-[var(--color-theme-muted)] mt-2">/ month</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Growth Tips */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[var(--color-theme-text)]">Growth Tips</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Complete Your Profile', icon: '👤' },
                { title: 'Stay Available', icon: '✅' },
                { title: 'Maintain Quick Responses', icon: '⚡' },
                { title: 'Build Positive Reviews', icon: '🌟' }
              ].map((item, idx) => (
                <div key={idx} className="bg-[var(--color-theme-dropdown)] p-4 rounded-xl border border-[var(--color-theme-border)] text-center flex flex-col items-center justify-center gap-2">
                   <span className="text-2xl">{item.icon}</span>
                   <span className="text-sm font-semibold text-[var(--color-theme-text)]">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-8 mt-12">
            <Link to="/doctor/requests" className="inline-flex items-center justify-center px-10 py-4 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-[var(--color-theme-button-text)] rounded-xl font-bold text-lg shadow-lg shadow-[var(--color-theme-primary)]/20 transition hover:-translate-y-1">
              View Patient Requests
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💰</div>
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2 relative z-10">Total Earnings</h3>
              <p className="text-3xl font-bold text-[var(--color-theme-primary)] relative z-10">₹{data.totalEarnings}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">This Month</h3>
              <p className="text-3xl font-bold text-[var(--color-theme-text)]">₹{data.thisMonthEarnings}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">This Week</h3>
              <p className="text-3xl font-bold text-[var(--color-theme-text)]">₹{data.thisWeekEarnings}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
              <h3 className="text-[var(--color-theme-muted)] font-medium text-sm mb-2">Completed Consultations</h3>
              <p className="text-3xl font-bold text-green-500">{data.completedConsultations}</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
            <h3 className="text-xl font-bold mb-6 text-[var(--color-theme-text)]">Earnings Trend</h3>
            <div className="h-64 w-full flex items-end gap-2 sm:gap-4 justify-between pt-8 border-b border-[var(--color-theme-border)] relative">
              {/* Y-Axis lines (approximate) */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-[var(--color-theme-muted)] w-full"></div>
                <div className="border-t border-[var(--color-theme-muted)] w-full"></div>
                <div className="border-t border-[var(--color-theme-muted)] w-full"></div>
                <div className="border-t border-[var(--color-theme-muted)] w-full"></div>
              </div>
              
              {chartData.map((data, index) => {
                const maxEarnings = Math.max(...chartData.map(d => d.earnings)) || 1;
                const heightPercentage = Math.max((data.earnings / maxEarnings) * 100, 5); // min 5% height

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative z-10">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] px-3 py-1 rounded-lg text-sm shadow-lg pointer-events-none whitespace-nowrap z-20">
                      ₹{Math.round(data.earnings)}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[3rem] bg-gradient-to-t from-[var(--color-theme-primary)]/20 to-[var(--color-theme-primary)] rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    {/* X-Axis Label */}
                    <span className="text-xs text-[var(--color-theme-muted)] mt-4 font-medium">{data.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-theme-border)]">
            <h3 className="text-xl font-bold mb-6 text-[var(--color-theme-text)]">Recent Transactions</h3>
            {data.recentTransactions.length === 0 ? (
              <p className="text-[var(--color-theme-muted)] text-center py-8">No recent transactions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-theme-border)] text-[var(--color-theme-muted)] text-sm uppercase tracking-wider">
                      <th className="pb-3 font-medium">Patient Name</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-[var(--color-theme-border)] last:border-0 hover:bg-[var(--color-theme-dropdown)] transition-colors">
                        <td className="py-4 font-medium text-[var(--color-theme-text)]">{tx.patientName}</td>
                        <td className="py-4 text-[var(--color-theme-muted)]">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-[var(--color-theme-text)]">₹{tx.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorEarnings;
