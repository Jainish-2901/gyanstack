import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- HELPER: Load User on Refresh ---
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

  // --- 1. Register ---
  const register = async (username, email, phone, password) => {
    try {
      const { data } = await api.post('/auth/register', {
        username, email, phone, password,
      });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed.');
    }
  };

  // --- 2. Login ---
  const login = async (loginId, password, preFetchedData = null) => {
    try {
      const data = preFetchedData || (await api.post('/auth/login', {
        loginId,
        password,
      })).data;

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed.');
    }
  };

  // --- 3. Logout ---
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Note: You might want to call a backend route here to clear the fcmToken 
    // so the user doesn't get notifications after logging out.
  };

  // --- 4. Password Recovery ---
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
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP.');
    }
  };

  // --- 5. Profile & Security Updates ---
  const updateProfile = async (formData) => {
    try {
      const { data } = await api.put('/auth/update-profile', formData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return "Profile updated successfully!";
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed.');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/change-password', { currentPassword, newPassword });
      return data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed.');
    }
  };

  // --- 6. NEW: Manual FCM Token Sync ---
  // This allows you to manually trigger a sync if needed outside of the NotificationBell
  const syncFCMToken = async (fcmToken) => {
    try {
      await api.post('/auth/update-fcm-token', { fcmToken });
      console.log("FCM Token synced via AuthContext");
    } catch (error) {
      console.error("FCM Sync Background Error:", error);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    forgotPasswordRequest,
    resetPassword,
    updateProfile,
    changePassword,
    syncFCMToken, // Exported for global use
  };

  if (loading) {
    return <LoadingScreen text="GyanStack is checking your credentials..." />;
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