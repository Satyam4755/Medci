import React from 'react';
import { motion } from 'framer-motion';

const GlobalLoader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full border-t-2 border-r-2 border-transparent border-t-[var(--color-theme-primary)] shadow-[0_0_15px_var(--color-theme-primary)]"
        />
        {/* Inner reverse rotating ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute w-16 h-16 rounded-full border-b-2 border-l-2 border-transparent border-b-[var(--color-theme-text)] opacity-50"
        />
        {/* Center static Logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-3xl font-extrabold text-foreground tracking-tighter"
        >
          M
        </motion.div>
      </div>
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-8 text-muted-foreground text-sm font-bold tracking-widest uppercase"
      >
        Loading...
      </motion.p>
    </motion.div>
  );
};

export default GlobalLoader;