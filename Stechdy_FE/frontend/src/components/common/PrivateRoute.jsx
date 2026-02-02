import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/authService';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin' && userRole !== 'moderator') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user needs to complete onboarding (except for admin and onboarding page itself)
  const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
  const isOnboardingPage = location.pathname === "/onboarding";
  
  if (!isOnboardingPage && hasCompletedOnboarding !== "true" && userRole !== 'admin' && userRole !== 'moderator') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default PrivateRoute;
