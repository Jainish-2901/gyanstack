import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminLayout from './components/AdminLayout'; // The new professional layout

// Components
import OfflineNotice from './components/OfflineNotice';

// Pages
import Login from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword'; 
import AdminPanel from './pages/admin/AdminPanel';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditProfile from './pages/public/EditProfile';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import ViewContentRequests from './pages/admin/ViewContentRequests';
import ContactInquiries from './pages/admin/ContactInquiries';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import MyAnnouncements from './pages/admin/MyAnnouncements';

export default function App() {
  return (
    <div className="App" style={{ minHeight: '100vh' }}> 
      <OfflineNotice />
      
      <Routes>
        {/* 1. Public Auth Routes (No Dashboard Layout) */}
        <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 2. PROTECTED DASHBOARD ROUTES (Wrapped in AdminLayout) */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard/admin" element={<AdminDashboard />} />
                  <Route path="admin-panel" element={<AdminPanel />} />
                  <Route path="settings" element={<EditProfile />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="dashboard/requests" element={<ViewContentRequests />} />
                  <Route path="dashboard/my-announcements" element={
                    <ProtectedRoute roles={['admin']}>
                      <MyAnnouncements />
                    </ProtectedRoute>
                  } />
                  
                  {/* Super Admin Restricted Routes */}
                  <Route path="dashboard/contact" element={
                    <ProtectedRoute roles={['superadmin']}> 
                      <ContactInquiries />
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard/users" element={
                    <ProtectedRoute roles={['superadmin']}> 
                      <ManageUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard/announcements-manage" element={
                    <ProtectedRoute roles={['superadmin']}> 
                      <ManageAnnouncements />
                    </ProtectedRoute>
                  } />

                  {/* 404 inside Dashboard */}
                  <Route path="*" element={
                    <div className='text-center py-5'>
                      <h1 className='display-1 fw-bold text-primary'>404</h1>
                      <p className='lead'>Dashboard section not found</p>
                      <Link to="/dashboard/admin" className="btn btn-primary rounded-pill">Go to Dashboard</Link>
                    </div>
                  } />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}