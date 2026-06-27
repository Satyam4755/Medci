import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileTopBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getProfilePath = () => {
    if (user?.role === 'Patient') return '/patient/profile';
    if (user?.role === 'Doctor') return '/doctor/profile';
    return '/admin/dashboard';
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 w-full z-50 glass-panel border-b border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center px-5 py-3">
        <h2 className="text-xl font-bold text-primary tracking-tight">Medcii</h2>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/20 flex items-center justify-center">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">{user?.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <span className="text-sm font-semibold hidden sm:block">{user?.name}</span>
            <ChevronDown size={16} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate(getProfilePath()); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings size={18} className="text-muted-foreground" />
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); toggleTheme(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-t border-border"
                  >
                    {theme === 'light' ? <Moon size={18} className="text-muted-foreground" /> : <Sun size={18} className="text-muted-foreground" />}
                    {theme === 'light' ? 'Black Theme' : 'Beige Theme'}
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors border-t border-border font-medium"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MobileTopBar;
