import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlobalLoader from './GlobalLoader';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <GlobalLoader />;

  if (user) {
    if (user.role === 'Patient') return <Navigate to="/patient/home" replace />;
    if (user.role === 'Doctor') return <Navigate to="/doctor/home" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
