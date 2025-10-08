import axios from 'axios';

// API base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/usuario',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
};

// Users API functions
export const usersAPI = {
  getAll: () => api.get('/users'),
};

export default api;