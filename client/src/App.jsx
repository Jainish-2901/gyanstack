import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
// FIX: Paths ko theek kiya gaya hai (assuming App.jsx is in src/)
import ProtectedRoute from './components/ProtectedRoute'; 

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineNotice from './components/OfflineNotice';
// LoadingScreen ki zaroorat nahi hai yahaan

// Kyunki previous attempts fail ho chuke hain, main is baar har import se './' hata raha hoon.
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Dashboard from './pages/public/Dashboard'; // Student Dashboard
import ForgotPassword from './pages/public/ForgotPassword'; 
import Browse from './pages/public/Browse';
import RequestContent from './pages/public/RequestContent';

import EditProfile from './pages/public/EditProfile'; 
import SavedContent from './pages/public/SavedContent'; 
import ContentDetailPage from './pages/public/ContentDetailPage'; 
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import UploaderProfile from './pages/public/UploaderProfile';

export default function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}> 
      <OfflineNotice />
      <Header />
      <PWAInstallPrompt />
      <main className="container-fluid py-4 flex-grow-1">
        <Routes>
          {/* 1. Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/browse" element={<Browse />} />

          <Route path="/content/:id" element={<ContentDetailPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/uploader/:id" element={<UploaderProfile />} />

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

          {/* ADMIN ROUTES HAVE BEEN MOVED TO THE SEPARATE ADMIN BUNDLE */}

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