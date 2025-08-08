// API de serviços - CRUD para gerenciamento de serviços do salão
import apiClient from './client';

export const servicesAPI = {
  // Lista todos os serviços disponíveis
  getAll: () => apiClient.get('/services'),
  
  // Cria novo serviço (admin)
  create: (service) => apiClient.post('/services', service),
  
  // Atualiza serviço existente (admin)
  update: (id, service) => apiClient.put(`/services/${id}`, service),
  
  // Remove serviço (admin)
  delete: (id) => apiClient.delete(`/services/${id}`)
};