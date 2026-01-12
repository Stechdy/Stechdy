import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/authService';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin' && userRole !== 'moderator') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
