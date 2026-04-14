import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP.');
    }
  };

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

  const syncFCMToken = async (fcmToken) => {
    try {
      await api.post('/auth/update-fcm-token', { fcmToken });
    } catch (error) {
      console.error("FCM Sync Background Error:", error);
    }
  };

  const value = {
    user,
    setUser, 
    loading,
    register,
    login,
    logout,
    forgotPasswordRequest,
    resetPassword,
    updateProfile,
    changePassword,
    syncFCMToken,
  };

  if (loading) {
    return <LoadingScreen text="GyanStack is checking your credentials..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);