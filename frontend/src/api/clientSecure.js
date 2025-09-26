import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token management
let csrfToken = null;

const getCsrfToken = async () => {
  if (!csrfToken) {
    try {
      const response = await apiClient.get('/csrf-token');
      csrfToken = response.data.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

// Request interceptor to add CSRF token
apiClient.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const token = await getCsrfToken();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      csrfToken = null; // Reset CSRF token
    }
    return Promise.reject(error);
  }
);

export default apiClient;