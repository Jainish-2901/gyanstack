import React from 'react';
import { Navigate } from 'react-router-dom';
// --- FIX: Paths ko 'src' folder root maankar update kiya gaya ---
import { useAuth } from '../context/AuthContext'; 
import LoadingScreen from '../components/LoadingScreen'; 
// -------------------------------------------------------------

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  // 1. Loading state
  if (loading) {
    return <LoadingScreen text="Checking Permissions..." />;
  }
  
  // 2. Auth Check: Agar login nahi hai, to login page par bhej do
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 3. Role Check: Agar authorized hain (admin ya superadmin), to content dikhayein
  if (user.role === 'admin' || user.role === 'superadmin') {
    return children;
  }
  
  // 4. Unauthorized (e.g., student): Uske apne dashboard par bhej do
  return <Navigate to="/dashboard" replace />;
}