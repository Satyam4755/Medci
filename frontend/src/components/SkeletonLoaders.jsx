import React from 'react';
import Skeleton from './Skeleton';

export const DashboardCardSkeleton = () => (
  <div className="glass-panel rounded-xl p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-4 w-24" />
  </div>
);

export const DoctorCardSkeleton = () => (
  <div className="glass-panel rounded-xl p-6">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="avatar" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export const AppointmentSkeleton = () => (
  <div className="glass-panel rounded-xl p-4">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-4 w-48" />
  </div>
);

export const NotificationSkeleton = () => (
  <div className="glass-panel rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <Skeleton variant="avatar" className="w-8 h-8" />
      <div className="flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="glass-panel rounded-xl p-6">
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton variant="avatar" className="w-20 h-20" />
      <div className="flex-1">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);