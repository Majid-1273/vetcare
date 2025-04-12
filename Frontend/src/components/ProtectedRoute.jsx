import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // 🚨 NEW: Redirect Farmer to /farm-details if farm is not registered
  if (
    user?.userType === 'Farmer' &&
    allowedRoles.includes('Farmer') &&
    user?.farmDetails === false
  ) {
    return <Navigate to="/farm-details" replace />;
  }
  // Check if user has the allowed role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.userType)) {
      if (user && user.userType === 'Farmer') {
        return <Navigate to="/home" replace />;
      } else if (user && user.userType === 'Vet') {
        return <Navigate to="/vet-dashboard" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }



  // All checks passed
  return <Outlet />;
};

export default ProtectedRoute;
