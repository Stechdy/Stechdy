import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/authService';

const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (authenticated) {
    // Redirect admin to admin dashboard
    if (userRole === 'admin' || userRole === 'moderator') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Redirect user to user dashboard
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;
