import apiClient from './client';

export const servicesAPI = {
  getAll: () => apiClient.get('/services'),
  create: (service) => apiClient.post('/services', service),
  update: (id, service) => apiClient.put(`/services/${id}`, service),
  delete: (id) => apiClient.delete(`/services/${id}`)
};