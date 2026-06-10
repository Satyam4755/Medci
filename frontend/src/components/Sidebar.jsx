import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import DeleteAccountModal from './DeleteAccountModal';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, changeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const patientLinks = [
    { name: 'Home', path: '/patient/home' },
    { name: 'Explore Doctors', path: '/patient/explore' },
    { name: 'Raise Request', path: '/patient/request' },
    { name: 'Appointments', path: '/patient/appointments' },
    { name: 'Prescriptions', path: '/patient/prescriptions' },
    { name: 'Notifications', path: '/patient/notifications' },
    { name: 'Profile Settings', path: '/patient/profile' },
  ];

  const doctorLinks = [
    { name: 'Home', path: '/doctor/home' },
    { name: 'Incoming Requests', path: '/doctor/requests' },
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

  const themes = [
    { id: 'theme-black', name: 'Black Hair' },
    { id: 'theme-brown', name: 'Brown Hair' },
    { id: 'theme-blonde', name: 'Blonde Hair' },
    { id: 'theme-grey', name: 'Grey Hair' },
  ];

  return (
    <div className="w-64 h-full glass-panel flex flex-col justify-between border-r border-[var(--color-theme-border)]">
      <div>
        <div className="p-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-theme-primary)' }}>Medci</h2>
          <p className="text-sm mt-2 opacity-70">Welcome, {user?.name}</p>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {links.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              onClick={() => { if (onClose) onClose(); }}
              className={({ isActive }) => `px-4 py-3 rounded-lg transition-all font-medium ${isActive ? 'bg-[var(--color-theme-primary)] text-[var(--color-theme-active-nav-text)] shadow-lg' : 'hover:bg-[var(--color-theme-primary)] hover:bg-opacity-20 hover:text-[var(--color-theme-text)]'}`}
              style={({ isActive }) => isActive ? {} : { color: 'var(--color-theme-muted)' }}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-[var(--color-theme-border)]">
        <p className="text-sm font-semibold mb-3 opacity-80">Choose your hair color theme</p>
        <select 
          value={theme} 
          onChange={(e) => changeTheme(e.target.value)}
          className="w-full bg-[var(--color-theme-panel)] border border-[var(--color-theme-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-theme-primary)] mb-6 text-[var(--color-theme-text)]"
        >
          {themes.map(t => <option key={t.id} value={t.id} className="bg-[var(--color-theme-panel)]">{t.name}</option>)}
        </select>
        <button 
          onClick={handleLogout}
          className="w-full py-2 rounded-lg border border-[var(--color-theme-border)] hover:bg-neutral-500/20 hover:text-neutral-400 transition mb-2"
        >
          Logout
        </button>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full py-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 transition"
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
