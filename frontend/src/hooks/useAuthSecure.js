import React, { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authAPI.validateToken();
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('No valid session found');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.data.success) {
      setUser(response.data.user);
      return response.data.user;
    } else {
      throw new Error(response.data.message || 'Erro no login');
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.data.success) {
      setUser(response.data.user);
      return response.data.user;
    } else {
      throw new Error(response.data.message || 'Erro no cadastro');
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value = { user, login, register, logout, loading };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};