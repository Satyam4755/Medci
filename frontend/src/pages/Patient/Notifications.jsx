import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/notifications`, config);
      setNotifications(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/notifications/${id}/read`, {}, config);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/notifications/read-all`, {}, config);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/notifications/${id}`, config);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">Stay updated with your appointments and prescriptions.</p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-card hover:bg-popover border border-border rounded-lg text-sm font-medium transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Empty State Hero */}
          <div className="glass-panel p-12 text-center rounded-2xl border border-border">
            <div className="w-20 h-20 bg-popover rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Notifications Yet</h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We’ll notify you whenever doctors respond, appointments are scheduled, prescriptions are uploaded, or important updates are available.
            </p>
          </div>

          {/* Educational Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-center">Common Hair Concerns We Treat</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'Hair Fall', icon: '🍂', desc: 'Excessive daily shedding' },
                { title: 'Baldness', icon: '👨‍🦲', desc: 'Receding hairlines or patches' },
                { title: 'Dandruff', icon: '❄️', desc: 'Flaky and itchy scalp' },
                { title: 'Hair Thinning', icon: '📉', desc: 'Loss of volume and density' },
                { title: 'Patchy Beard', icon: '🧔', desc: 'Uneven facial hair growth' },
                { title: 'Scalp Infection', icon: '🦠', desc: 'Redness or inflammation' }
              ].map((item, idx) => (
                <div key={idx} className="bg-card p-6 rounded-xl border border-border hover:border-primary transition text-center group cursor-pointer">
                  <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{item.icon}</span>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-8">
            <Link to="/patient/explore" className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition hover:-translate-y-1">
              Explore Doctors
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-xl border transition relative overflow-hidden ${notif.read ? 'bg-card border-border' : 'bg-popover border-primary/50 shadow-md'}`}
              >
                {/* Unread Indicator Bar */}
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${notif.read ? 'bg-neutral-800' : 'bg-primary/20'}`}>
                    {notif.icon || '🔔'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-lg ${notif.read ? 'text-foreground' : 'text-primary'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1">{notif.description}</p>
                    
                    <div className="flex gap-4 mt-4">
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif._id)} className="text-sm font-medium text-primary hover:underline">
                          Mark as Read
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif._id)} className="text-sm font-medium text-destructive hover:text-red-400 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
