import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useGlobalLoading } from './GlobalLoadingContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useGlobalLoading();

  useEffect(() => {
    const validateToken = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        try {
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/auth/me`, config);
          // Keep token from localStorage since /me might not return it
          setUser({ ...data, token: parsedUser.token });
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      }
      setLoading(false);
    };
    validateToken();
  }, []);

  const login = async (email, password) => {
    startLoading('Authenticating...');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/auth/login`, { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    } finally {
      stopLoading();
    }
  };

  const register = async (name, email, password, role, location) => {
    startLoading('Creating your account...');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/auth/register`, { name, email, password, role, location });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    } finally {
      stopLoading();
    }
  };

  const sendOtp = async (email) => {
    startLoading('Sending verification code...');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/auth/send-otp`, { email });
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    } finally {
      stopLoading();
    }
  };

  const verifyOtp = async (email, otp) => {
    startLoading('Verifying code...');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/auth/verify-otp`, { email, otp });
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    } finally {
      stopLoading();
    }
  };

  const sendDeleteOtp = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/account/send-delete-otp`, {}, config);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const verifyDeleteOtp = async (otp) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/account/verify-delete-otp`, { otp }, config);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const deleteAccount = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5006'}/api/account/delete`, config);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, sendOtp, verifyOtp, sendDeleteOtp, verifyDeleteOtp, deleteAccount, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
