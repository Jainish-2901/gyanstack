import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();
// Example of client-side subscription logic (to be integrated into AuthContext useEffect)
  const subscribeToNotifications = async (userId) => {
      // 1. Firebase Messaging service worker ko register karein
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // 2. Permission request karein
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
          const messaging = firebase.messaging(); // Assume firebase library is imported/available
          
          // 3. Token generate karein
          const token = await messaging.getToken({ vapidKey: 'YOUR_VAPID_PUBLIC_KEY', serviceWorkerRegistration: registration });
          
          // 4. Token ko backend par save karein
          if (token) {
              await api.post('/users/subscribe', { fcmToken: token });
              console.log("FCM Token saved to backend.");
          }
      }
  };
  
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me'); 
          setUser(data);
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // --- (register, login, logout, forgotPassword, resetPassword functions pehle se hain...) ---

  const register = async (username, email, phone, password) => {
    try {
      const { data } = await api.post('/auth/register', {
        username, email, phone, password,
      });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user; 
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed due to server error.';
      throw new Error(msg);
    }
  };

  const login = async (loginId, password) => {
    try {
      const { data } = await api.post('/auth/login', {
        loginId,
        password,
      });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Invalid credentials.';
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const forgotPasswordRequest = async (email) => {
    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      return data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const resetPassword = async (otp, newPassword) => {
    try {
      const { data } = await api.post('/auth/resetpassword', { otp, newPassword });
      return data.message;
    } catch (error)
    {
      throw new Error(error.response?.data?.message || 'Invalid or expired OTP.');
    }
  };

  // --- YEH NAYE FUNCTIONS HAIN ---

  // 7. Profile Update (Username/Phone)
  const updateProfile = async (username, phone) => {
    try {
      // API call to backend
      const { data } = await api.put('/auth/update-profile', { username, phone });
      
      // Naya token aur user data save karein (taaki Header mein naam update ho)
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      return "Profile updated successfully!";
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed.';
      throw new Error(msg);
    }
  };

  // 8. Password Change (Dashboard se)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // API call to backend
      const { data } = await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return data.message; // "Password changed successfully"
    } catch (error) {
      const msg = error.response?.data?.message || 'Password change failed.';
      throw new Error(msg);
    }
  };

  // ---------------------------------

  const value = {
    user,
    loading,
    register,
    login,  
    logout,
    forgotPasswordRequest,
    resetPassword,
    updateProfile, // <-- Naya function add karein
    changePassword, // <-- Naya function add karein
  };

  if (loading) {
    return <LoadingScreen text="Authenticating user..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}