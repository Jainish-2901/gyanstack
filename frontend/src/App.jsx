import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
// FIX: Paths ko theek kiya gaya hai (assuming App.jsx is in src/)
import ProtectedRoute from './components/ProtectedRoute'; 

// Components
import Header from './components/Header';
import Footer from './components/Footer';
// LoadingScreen ki zaroorat nahi hai yahaan

// Kyunki previous attempts fail ho chuke hain, main is baar har import se './' hata raha hoon.
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard'; // Student Dashboard
import ForgotPassword from './pages/ForgotPassword'; 
import Browse from './pages/Browse';
import RequestContent from './pages/RequestContent';
import AdminProfile from './pages/AdminProfile';
import AdminPanel from './pages/AdminPanel'; // Content Management (Admin Only)
import SuperAdminPanel from './pages/SuperAdminPanel'; // User/Role Management (SuperAdmin Only)
import EditProfile from './pages/EditProfile'; 
import SavedContent from './pages/SavedContent'; 
import ContentDetailPage from './pages/ContentDetailPage'; 
import AdminDashboard from './pages/AdminDashboard'; // Analytics/Stats
import AnnouncementsPage from './pages/AnnouncementsPage';

export default function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}> 
      <Header />
      <main className="container-fluid py-4 flex-grow-1">
        <Routes>
          {/* 1. Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/browse" element={<Browse />} />
          <Route path="/admin/:adminId" element={<AdminProfile />} />
          <Route path="/content/:id" element={<ContentDetailPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />

          {/* 2. Authenticated Routes (Students and All Users) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard /> {/* Student/General User Dashboard */}
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/saved" element={
            <ProtectedRoute>
              <SavedContent />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/request" element={
            <ProtectedRoute>
              <RequestContent />
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