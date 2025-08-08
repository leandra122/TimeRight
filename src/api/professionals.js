import apiClient from './client';

export const professionalsAPI = {
  getAll: (category) => apiClient.get('/professionals', { params: { category } }),
  getAvailability: (id, date) => apiClient.get(`/professionals/${id}/availability`, { params: { date } }),
  create: (professional) => apiClient.post('/professionals', professional),
  update: (id, professional) => apiClient.put(`/professionals/${id}`, professional),
  delete: (id) => apiClient.delete(`/professionals/${id}`)
};