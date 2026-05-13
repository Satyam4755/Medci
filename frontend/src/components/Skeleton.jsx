import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className, variant = 'default' }) => {
  const baseClasses = "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded";

  const variants = {
    default: baseClasses,
    card: `${baseClasses} h-32`,
    text: `${baseClasses} h-4`,
    avatar: `${baseClasses} w-12 h-12 rounded-full`,
    button: `${baseClasses} h-10 w-24`,
  };

  return (
    <div className={`${variants[variant]} ${className}`} />
  );
};

export default Skeleton;