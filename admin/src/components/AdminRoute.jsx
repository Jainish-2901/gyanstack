import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import LoadingScreen from '../components/LoadingScreen'; 

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen text="Checking Permissions..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'admin' || user.role === 'superadmin') {
    return children;
  }
  
  return <Navigate to="/dashboard" replace />;
}