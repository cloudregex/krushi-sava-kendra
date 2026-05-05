import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, module, action }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  if (module && action && !hasPermission(module, action)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
