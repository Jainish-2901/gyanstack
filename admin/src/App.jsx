import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoadingScreen from './components/LoadingScreen';

// Always-loaded (app-wide shell)
import OfflineNotice from './components/OfflineNotice';

// Lazy-loaded admin pages — each page becomes its own JS chunk
const Login                 = lazy(() => import('./pages/public/Login'));
const ForgotPassword        = lazy(() => import('./pages/public/ForgotPassword'));
const AdminDashboard        = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPanel            = lazy(() => import('./pages/admin/AdminPanel'));
const EditProfile           = lazy(() => import('./pages/public/EditProfile'));
const AnnouncementsPage     = lazy(() => import('./pages/admin/AnnouncementsPage'));
const ViewContentRequests   = lazy(() => import('./pages/admin/ViewContentRequests'));
const ContactInquiries      = lazy(() => import('./pages/admin/ContactInquiries'));
const ManageUsers           = lazy(() => import('./pages/admin/ManageUsers'));
const ManageAnnouncements   = lazy(() => import('./pages/admin/ManageAnnouncements'));
const MyAnnouncements       = lazy(() => import('./pages/admin/MyAnnouncements'));
const GlobalContentManager  = lazy(() => import('./pages/admin/GlobalContentManager'));
const NotFound              = lazy(() => import('./pages/admin/NotFound'));

export default function App() {
  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <OfflineNotice />

      <Suspense fallback={<LoadingScreen text="Loading admin panel..." />}>
        <Routes>
          {/* 1. Public Auth Routes */}
          <Route path="/"               element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 2. Protected Dashboard Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute roles={['admin', 'superadmin']}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard/admin"   element={<AdminDashboard />} />
                    <Route path="admin-panel"        element={<AdminPanel />} />
                    <Route path="settings"           element={<EditProfile />} />
                    <Route path="announcements"      element={<AnnouncementsPage />} />
                    <Route path="dashboard/requests" element={<ViewContentRequests />} />

                    <Route path="dashboard/my-announcements" element={
                      <ProtectedRoute roles={['admin']}>
                        <MyAnnouncements />
                      </ProtectedRoute>
                    } />

                    {/* Super Admin Only */}
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
                    <Route path="dashboard/global-content" element={
                      <ProtectedRoute roles={['superadmin']}>
                        <GlobalContentManager />
                      </ProtectedRoute>
                    } />
                    <Route path="dashboard/announcements-manage" element={
                      <ProtectedRoute roles={['superadmin']}>
                        <ManageAnnouncements />
                      </ProtectedRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Global catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}