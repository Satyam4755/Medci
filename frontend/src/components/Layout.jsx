import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full glass-panel z-50 p-4 flex justify-between items-center border-b border-[var(--color-theme-border)]">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-theme-primary)' }}>Medci</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="glass-panel p-8 rounded-xl w-3/4 max-w-sm relative">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-xl">✕</button>
            <p className="text-center opacity-70 mb-4">Please use desktop for best experience during beta.</p>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 mt-16 md:mt-0 overflow-y-auto">
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
