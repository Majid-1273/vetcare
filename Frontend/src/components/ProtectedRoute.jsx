// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // Check if user is authenticated and has the required role
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.userType)) {
      // Redirect to an appropriate page based on user type
      if (user && user.userType === 'Farmer') {
        return <Navigate to="/home" replace />;
      } else if (user && user.userType === 'Vet') {
        return <Navigate to="/vet-dashboard" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // User is authenticated and has required role (if any)
  return <Outlet />;
};

export default ProtectedRoute;