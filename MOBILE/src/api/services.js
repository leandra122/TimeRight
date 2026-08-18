import { api } from './client';

export const authApi = {
  login: (username, senha) => api.post('/api/auth/login', { username, senha }),
  register: (nome, email, password) => api.post('/api/auth/register/client', { nome, email, password }),
};

export const catalogApi = {
  salons: () => api.get('/saloes'),
  salon: (id) => api.get(`/saloes/${id}`),
  services: (salonId) => api.get(`/servicos/salao/${salonId}`),
  employees: (salonId) => api.get(`/catalogo/saloes/${salonId}/funcionarios`),
};

export const appointmentsApi = {
  list: () => api.get('/api/client/agendamentos'),
  create: (payload) => api.post('/api/client/agendamentos', payload),
  cancel: (id) => api.patch(`/api/client/agendamentos/${id}/cancelar`),
};
