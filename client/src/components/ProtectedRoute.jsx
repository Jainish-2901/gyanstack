import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // AuthContext ab loading screen dikhayega, lekin yahaan bhi safety ke liye loading check karein
    return <LoadingScreen text="Checking access..." />; 
  }

  // 1. Check karein ki user logged-in hai (user object null nahi hai)
  if (!user) {
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check karein ki user ke paas zaroori role hai
  if (roles && !roles.includes(user.role)) {
    // Role match nahi hua, home page par bhej do
    console.warn("Access Denied: User role", user.role, "not in", roles);
    return <Navigate to="/" replace />; // Home ya Dashboard par redirect karein
  }

  // Sab thik hai, page dikhayein
  return children;
}