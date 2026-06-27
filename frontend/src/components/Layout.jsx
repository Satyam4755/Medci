import React from 'react';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';
import MobileBottomNav from './MobileBottomNav';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Mobile Top Bar */}
      <MobileTopBar />

      <div className="flex flex-1 overflow-hidden pt-[60px] lg:pt-0 pb-[72px] lg:pb-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-full w-full relative p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
