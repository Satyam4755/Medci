import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { patientLinks, doctorLinks, adminLinks } from '../config/navigation';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // The links arrays are now imported from config/navigation.js
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
              <link.icon size={20} className="shrink-0 transition-colors" />
              {link.name}
            </NavLink>
          ))}
          {/* Append Profile Settings to the desktop sidebar to keep it unchanged */}
          {user?.role === 'Patient' && (
            <NavLink to="/patient/profile" onClick={() => { if (onClose) onClose(); }} className={({ isActive }) => `px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3 group ${isActive ? 'bg-primary text-primary-foreground shadow-lg [&_*]:text-primary-foreground' : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:[&_*]:text-primary-foreground'}`}>
              <Sun size={20} className="shrink-0 opacity-0 w-0 hidden" />
              Profile Settings
            </NavLink>
          )}
          {user?.role === 'Doctor' && (
            <NavLink to="/doctor/profile" onClick={() => { if (onClose) onClose(); }} className={({ isActive }) => `px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3 group ${isActive ? 'bg-primary text-primary-foreground shadow-lg [&_*]:text-primary-foreground' : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:[&_*]:text-primary-foreground'}`}>
              <Sun size={20} className="shrink-0 opacity-0 w-0 hidden" />
              Profile Settings
            </NavLink>
          )}
        </nav>
        
        {user?.role === 'Doctor' && user?.verificationStatus === 'pending' && (
          <div className="mx-4 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-500 font-bold mb-2">Unverified Account</p>
            <NavLink to="/doctor/verify" onClick={() => { if (onClose) onClose(); }} className="text-xs text-white bg-red-500 w-full text-center block py-2 rounded-lg font-bold hover:bg-red-600">
              Verify Now
            </NavLink>
          </div>
        )}
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
      </div>
    </div>
  );
};

export default Sidebar;
