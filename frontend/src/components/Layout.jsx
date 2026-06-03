import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      
      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full glass-panel z-50 p-4 flex justify-between items-center border-b border-[var(--color-theme-border)]">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-theme-primary)' }}>Medci</h2>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2">
          ☰
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[60] flex">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="relative w-64 h-full bg-[var(--color-theme-panel)] shadow-2xl z-10"
          >
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="absolute top-4 right-4 text-2xl text-[var(--color-theme-text)] z-20"
            >✕</button>
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto h-full pb-20 md:pb-8 w-full max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
