import axios from 'axios';
import { API_URL, validateApiUrl } from '../config/apiConfig';
import { clearSession, loadSession } from '../storage/sessionStorage';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use(async (config) => {
  if (!validateApiUrl()) return Promise.reject(new Error('URL da API inválida.'));
  const session = await loadSession();
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/api/auth/login')) {
      await clearSession();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Não foi possível concluir a operação.') {
  const data = error.response?.data;
  if (typeof data === 'string' && data.length < 240) return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (error.message === 'URL da API inválida.') return error.message;
  if (!error.response) return 'Não foi possível acessar o servidor. Verifique a URL da API e sua conexão.';
  return fallback;
}
