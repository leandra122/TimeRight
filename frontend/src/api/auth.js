// API de autenticação - funções para login, cadastro e logout
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://cuddly-doodle-x5v5x45w6xpgcvxvj-8080.app.github.dev',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authAPI = {
  // Realiza login do usuário
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Registra novo usuário
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // Valida token e obtém dados do usuário
  validateToken: () => apiClient.get('/auth/me'),
  
  // Faz logout removendo dados do localStorage e invalidando sessão
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};