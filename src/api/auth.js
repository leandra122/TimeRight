// API de autenticação - funções para login, cadastro e logout
import apiClient from './client';

export const authAPI = {
  // Realiza login do usuário
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Registra novo usuário
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // Faz logout removendo dados do localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};