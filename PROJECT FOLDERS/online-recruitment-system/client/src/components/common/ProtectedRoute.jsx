import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return children;
};

export const GuestOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/jobs'} replace />;
  }

  return children;
};
