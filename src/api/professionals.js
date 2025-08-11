// API de profissionais - CRUD e consulta de disponibilidade
import apiClient from './client';

export const professionalsAPI = {
  // Lista profissionais, opcionalmente filtrados por categoria
  getAll: (category) => apiClient.get('/professionals', { params: { category } }),
  
  // Consulta disponibilidade de horários de um profissional em uma data
  getAvailability: (id, date) => apiClient.get(`/professionals/${id}/availability`, { params: { date } }),
  
  // Cria novo profissional (admin)
  create: (professional) => apiClient.post('/professionals', professional)
};