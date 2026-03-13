import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
// FIX: Paths ko theek kiya gaya hai (assuming App.jsx is in src/)
import ProtectedRoute from './components/ProtectedRoute'; 

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import OfflineNotice from './components/OfflineNotice';
// LoadingScreen ki zaroorat nahi hai yahaan

// Kyunki previous attempts fail ho chuke hain, main is baar har import se './' hata raha hoon.
import { Navigate } from 'react-router-dom';
import Login from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword'; 
import AdminPanel from './pages/admin/AdminPanel'; // Content Management (Admin Only)
import SuperAdminPanel from './pages/admin/SuperAdminPanel'; // User/Role Management (SuperAdmin Only)
import AdminDashboard from './pages/admin/AdminDashboard'; // Analytics/Stats
import EditProfile from './pages/public/EditProfile'; // Account Settings
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import ViewContentRequests from './pages/admin/ViewContentRequests';

export default function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}> 
      <OfflineNotice />
      <Header />
      <main className="container-fluid py-4 flex-grow-1">
        <Routes>
          {/* 1. Public Auth Routes */}
          <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 2. Common Protected Routes */}
          <Route path="/settings" element={
            <ProtectedRoute roles={['admin', 'superadmin']}> 
              <EditProfile />
            </ProtectedRoute>
          } />

          <Route path="/announcements" element={
            <ProtectedRoute roles={['admin', 'superadmin']}> 
              <AnnouncementsPage />
            </ProtectedRoute>
          } />

          {/* 3. ADMIN/SUPERADMIN ONLY ROUTES */}
          
          {/* Admin Dashboard (Analytics & Stats - Admin and Superadmin ko dikhega) */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin', 'superadmin']}> 
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Panel (Content, Upload, Category Management - Admin and Superadmin ko dikhega) */}
          <Route path="/admin-panel" element={
            <ProtectedRoute roles={['admin', 'superadmin']}> 
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/requests" element={
            <ProtectedRoute roles={['admin', 'superadmin']}> 
              <ViewContentRequests />
            </ProtectedRoute>
          } />
          
          {/* Super Admin Panel (User Roles, Global Control - ONLY Superadmin ko dikhega) */}
          <Route path="/super-admin-panel" element={
            <ProtectedRoute roles={['superadmin']}> 
              <SuperAdminPanel />
            </ProtectedRoute>
          } />

          {/* 4. 404 Page */}
          <Route path="*" element={
            <div className='text-center'>
              <h1 className='display-1 fw-bold'>404</h1>
              <p className='lead'>Page Not Found</p>
              <Link to="/">Go back home</Link>
            </div>
          } />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}