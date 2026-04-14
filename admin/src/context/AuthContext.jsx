import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

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


  const updateProfile = async (formData) => {
    try {
      const { data } = await api.put('/auth/update-profile', formData);
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      return "Profile updated successfully!";
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed.';
      throw new Error(msg);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return data.message; 
    } catch (error) {
      const msg = error.response?.data?.message || 'Password change failed.';
      throw new Error(msg);
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