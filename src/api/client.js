// Configuração centralizada do cliente HTTP Axios
import axios from 'axios';

// URL base da API obtida das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Criação da instância do Axios com configurações padrão
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição: adiciona token JWT automaticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: trata erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se token inválido, remove e redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;