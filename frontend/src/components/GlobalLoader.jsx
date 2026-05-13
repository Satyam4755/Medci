import React from 'react';
import { motion } from 'framer-motion';
import { useGlobalLoading } from '../context/GlobalLoadingContext';

const GlobalLoader = () => {
  const { isLoading, loadingMessage } = useGlobalLoading();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Medci Logo */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-8 bg-white rounded-full"
            />
          </motion.div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-white text-lg font-medium"
          >
            {loadingMessage}
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-1 bg-white/20 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{
                x: [-32, 32],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GlobalLoader;