import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import UserLayout from './components/UserLayout';
import LoadingScreen from './components/LoadingScreen';
import 'bootstrap/dist/css/bootstrap.min.css';
import OfflineNotice from './components/OfflineNotice';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';

const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'));
const ChatWidget       = lazy(() => import('./components/ChatWidget'));

const Home              = lazy(() => import('./pages/public/Home'));
const Login             = lazy(() => import('./pages/public/Login'));
const Signup            = lazy(() => import('./pages/public/Signup'));
const ForgotPassword    = lazy(() => import('./pages/public/ForgotPassword'));
const Browse            = lazy(() => import('./pages/public/Browse'));
const ContentDetailPage = lazy(() => import('./pages/public/ContentDetailPage'));
const Contact           = lazy(() => import('./pages/public/Contact'));
const AnnouncementsPage = lazy(() => import('./pages/public/AnnouncementsPage'));
const UploaderProfile   = lazy(() => import('./pages/public/UploaderProfile'));
const Dashboard         = lazy(() => import('./pages/public/Dashboard'));
const SavedContent      = lazy(() => import('./pages/public/SavedContent'));
const MyInquiries       = lazy(() => import('./pages/public/MyInquiries'));
const EditProfile       = lazy(() => import('./pages/public/EditProfile'));
const RequestContent    = lazy(() => import('./pages/public/RequestContent'));
const NotFound          = lazy(() => import('./pages/public/NotFound'));
const PrivacyPolicy     = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService    = lazy(() => import('./pages/public/TermsOfService'));
const About             = lazy(() => import('./pages/public/About'));

export default function App() {
  const location = useLocation();
  return (
    <div className="App">
      <ScrollToTop />
      <BackToTop />
      <OfflineNotice />
      <Toaster 
        position="top-right" 
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            padding: '12px 20px',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: { primary: '#0d6efd', secondary: '#fff' },
            style: { borderLeft: '5px solid #0d6efd' }
          },
          error: {
            iconTheme: { primary: '#dc3545', secondary: '#fff' },
            style: { borderLeft: '5px solid #dc3545' }
          }
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                <div className="flex-grow-1 px-2">{message}</div>
                {t.type !== 'loading' && (
                  <button 
                    onClick={() => toast.dismiss(t.id)}
                    className="btn btn-sm btn-link text-muted p-0 ms-2 text-decoration-none"
                    style={{ fontSize: '18px', lineHeight: '1' }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>

      <Suspense fallback={<LoadingScreen text="Loading GyanStack..." />}>
        <PWAInstallPrompt />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
          <Route element={<PublicLayout />}>
            <Route path="/"                element={<Home />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/browse"          element={<Browse />} />
            <Route path="/content/:id"     element={<ContentDetailPage />} />
            <Route path="/contact"         element={<Contact />} />
            <Route path="/announcements"   element={<AnnouncementsPage />} />
            <Route path="/uploader/:id"    element={<UploaderProfile />} />
            <Route path="/privacy"         element={<PrivacyPolicy />} />
            <Route path="/terms"           element={<TermsOfService />} />
            <Route path="/about"           element={<About />} />
            <Route path="*"               element={<NotFound />} />
          </Route>

          <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/dashboard/saved"     element={<SavedContent />} />
            <Route path="/dashboard/inquiries" element={<MyInquiries />} />
            <Route path="/settings"            element={<EditProfile />} />
            <Route path="/request"             element={<RequestContent />} />
          </Route>
          </Routes>
        </AnimatePresence>

        <ChatWidget />
      </Suspense>
    </div>
  );
}