// API de serviços - CRUD para gerenciamento de serviços do salão
import apiClient from './client';

export const servicesAPI = {
  // Lista todos os serviços disponíveis
  getAll: () => apiClient.get('/services'),
  
  // Busca serviços por categoria
  getByCategory: (category) => apiClient.get(`/services?category=${category}`),
  
  // Cria novo serviço (admin)
  create: (service) => apiClient.post('/services', service)
};