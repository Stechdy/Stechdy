import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/authService';
import AdminThemeWrapper from './AdminThemeWrapper';

const AdminPrivateRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();
  const location = useLocation();

  if (!authenticated) {
    // Save current location to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Only allow admin and moderator roles
  if (userRole !== 'admin' && userRole !== 'moderator') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminThemeWrapper>
      {children}
    </AdminThemeWrapper>
  );
};

export default AdminPrivateRoute;
