import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const patientLinks = [
    { name: 'Home', path: '/patient/home' },
    { name: 'Explore Doctors', path: '/patient/explore' },
    { name: 'Nearby Doctors', path: '/patient/map' },
    { name: 'Raise Request', path: '/patient/request' },
    { name: 'Appointments', path: '/patient/appointments' },
    { name: 'Prescriptions', path: '/patient/prescriptions' },
    { name: 'Notifications', path: '/patient/notifications' },
    { name: 'Profile Settings', path: '/patient/profile' },
  ];

  const doctorLinks = [
    { name: 'Home', path: '/doctor/home' },
    { name: 'Incoming Requests', path: '/doctor/requests' },
    { name: 'Potential Patients', path: '/doctor/map' },
    { name: 'Appointments', path: '/doctor/appointments' },
    { name: 'Earnings', path: '/doctor/earnings' },
    { name: 'Availability', path: '/doctor/availability' },
    { name: 'Profile Settings', path: '/doctor/profile' },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Doctors', path: '/admin/doctors' },
    { name: 'Revenue', path: '/admin/revenue' },
  ];

  let links = [];
  if (user?.role === 'Patient') links = patientLinks;
  else if (user?.role === 'Doctor') links = doctorLinks;
  else if (user?.role === 'Admin') links = adminLinks;



  return (
    <div className="w-64 h-full glass-panel flex flex-col justify-between border-r border-border">
      <div>
        <div className="p-6">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Medcii</h2>
          <p className="text-sm mt-2 opacity-70">Welcome, {user?.name}</p>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {links.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              onClick={() => { if (onClose) onClose(); }}
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3 group ${isActive ? 'bg-primary text-primary-foreground shadow-lg [&_*]:text-primary-foreground' : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:[&_*]:text-primary-foreground'}`}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-border">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 mb-6 transition-all text-muted-foreground hover:bg-muted hover:text-foreground hover:[&_*]:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className="text-sm font-semibold transition-colors">
            {theme === 'light' ? 'Beige Theme' : 'Black Theme'}
          </span>
          <div className="relative w-6 h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute text-primary"
                >
                  <Sun size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute text-primary"
                >
                  <Moon size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full py-2 rounded-lg border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:[&_*]:text-primary-foreground transition mb-2"
        >
          Logout
        </button>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:[&_*]:text-destructive-foreground border border-destructive/20 transition"
        >
          Delete My Account
        </button>
      </div>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
};

export default Sidebar;
