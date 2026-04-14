import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoadingScreen from './components/LoadingScreen';
import OfflineNotice from './components/OfflineNotice';

const Login = lazy(() => import('./pages/public/Login'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const EditProfile = lazy(() => import('./pages/public/EditProfile'));
const AnnouncementsPage = lazy(() => import('./pages/admin/AnnouncementsPage'));
const ViewContentRequests = lazy(() => import('./pages/admin/ViewContentRequests'));
const ContactInquiries = lazy(() => import('./pages/admin/ContactInquiries'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageAnnouncements = lazy(() => import('./pages/admin/ManageAnnouncements'));
const MyAnnouncements = lazy(() => import('./pages/admin/MyAnnouncements'));
const GlobalContentManager = lazy(() => import('./pages/admin/GlobalContentManager'));
const AnnouncementDetailPage = lazy(() => import('./pages/admin/AnnouncementDetailPage'));
const NotFound = lazy(() => import('./pages/admin/NotFound'));

export default function App() {
  const location = useLocation();

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <OfflineNotice />

      <Suspense fallback={<LoadingScreen text="Loading admin panel..." />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute roles={['admin', 'superadmin']}>
                  <AdminLayout>
                    <AnimatePresence mode="wait">
                      <Routes location={location} key={location.pathname}>
                        <Route path="dashboard/admin" element={<AdminDashboard />} />
                        <Route path="admin-panel" element={<AdminPanel />} />
                        <Route path="settings" element={<EditProfile />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="dashboard/announcements/:id" element={<AnnouncementDetailPage />} />
                        <Route path="dashboard/requests" element={<ViewContentRequests />} />

                        <Route path="dashboard/my-announcements" element={
                          <ProtectedRoute roles={['admin']}>
                            <MyAnnouncements />
                          </ProtectedRoute>
                        } />

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
                    </AnimatePresence>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Global catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}