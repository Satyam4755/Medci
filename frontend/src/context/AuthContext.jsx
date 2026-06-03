import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useGlobalLoading } from './GlobalLoadingContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useGlobalLoading();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    startLoading('Authenticating...');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/auth/login`, { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    } finally {
      stopLoading();
    }
  };

  const register = async (name, email, password, role) => {
    startLoading('Creating your account...');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5007'}/api/auth/register`, { name, email, password, role });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    } finally {
      stopLoading();
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
