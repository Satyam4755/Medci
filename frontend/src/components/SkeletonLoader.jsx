import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="glass-panel p-6 rounded-2xl w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-theme-muted)]/20 animate-pulse flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--color-theme-muted)]/20 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-[var(--color-theme-muted)]/20 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="h-3 bg-[var(--color-theme-muted)]/20 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-[var(--color-theme-muted)]/20 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-[var(--color-theme-muted)]/20 rounded w-4/6 animate-pulse"></div>
        </div>
        <div className="h-10 bg-[var(--color-theme-muted)]/20 rounded-lg w-full animate-pulse mt-auto"></div>
      </div>
    );
  }

  if (type === 'dashboard-stat') {
    return (
      <div className="glass-panel p-6 rounded-2xl w-full flex flex-col justify-between h-32">
        <div className="h-4 bg-[var(--color-theme-muted)]/20 rounded w-1/2 animate-pulse"></div>
        <div className="h-8 bg-[var(--color-theme-muted)]/20 rounded w-1/3 animate-pulse mt-4"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[var(--color-theme-muted)]/20 animate-pulse rounded-lg"></div>
  );
};

export default SkeletonLoader;
