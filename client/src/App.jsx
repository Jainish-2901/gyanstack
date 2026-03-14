import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import PublicLayout from './components/PublicLayout';
import UserLayout from './components/UserLayout';

// Components
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineNotice from './components/OfflineNotice';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Dashboard from './pages/public/Dashboard'; 
import ForgotPassword from './pages/public/ForgotPassword'; 
import Browse from './pages/public/Browse';
import RequestContent from './pages/public/RequestContent';
import Contact from './pages/public/Contact';
import EditProfile from './pages/public/EditProfile'; 
import SavedContent from './pages/public/SavedContent'; 
import ContentDetailPage from './pages/public/ContentDetailPage'; 
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import UploaderProfile from './pages/public/UploaderProfile';
import MyInquiries from './pages/public/MyInquiries';
import ChatWidget from './components/ChatWidget'; 
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <div className="App"> 
      <ScrollToTop />
      <OfflineNotice />
      <PWAInstallPrompt />
      
      <Routes>
        {/* 1. Public Pages (Header + Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/browse" element={<Browse />} />
          <Route path="/content/:id" element={<ContentDetailPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/uploader/:id" element={<UploaderProfile />} />
          
          {/* 404 in Public Layout */}
          <Route path="*" element={
            <div className='text-center py-5'>
              <h1 className='display-1 fw-bold'>404</h1>
              <p className='lead'>Page Not Found</p>
              <Link to="/" className="btn btn-primary mt-3">Go back home</Link>
            </div>
          } />
        </Route>

        {/* 2. User Dashboard Pages (Sidebar + Profile Header) */}
        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/saved" element={<SavedContent />} />
          <Route path="/dashboard/inquiries" element={<MyInquiries />} />
          <Route path="/settings" element={<EditProfile />} />
          <Route path="/request" element={<RequestContent />} />
        </Route>
      </Routes>

      <ChatWidget />
    </div>
  );
}