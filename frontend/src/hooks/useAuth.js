// Hook de autenticação - gerencia estado global do usuário logado
import React, { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/auth';

// Contexto para compartilhar estado de autenticação
const AuthContext = createContext();

// Provider que envolve a aplicação e fornece funções de auth
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Dados do usuário logado
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Verifica se há usuário logado ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.validateToken();
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            // Token inválido, limpar dados
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Função de login
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.data.success) {
      const { token, user } = response.data;
      // Salva token e dados do usuário
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } else {
      throw new Error(response.data.message || 'Erro no login');
    }
  };

  // Função de registro
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.data.success) {
      const { token, user } = response.data;
      // Salva token e dados do usuário
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } else {
      throw new Error(response.data.message || 'Erro no cadastro');
    }
  };

  // Função de logout
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  // Valores fornecidos pelo contexto
  const value = { user, login, register, logout, loading };

  // Retorna provider com React.createElement para evitar problemas de JSX
  return React.createElement(AuthContext.Provider, { value }, children);
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};