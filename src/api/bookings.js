// API de agendamentos - gerenciamento de bookings
import apiClient from './client';

export const bookingsAPI = {
  // Cria novo agendamento
  create: (booking) => apiClient.post('/bookings', booking),
  
  // Lista agendamentos de um usuário específico
  getUserBookings: (userId) => apiClient.get('/bookings', { params: { userId } }),
  
  // Lista todos os agendamentos (admin)
  getAllBookings: () => apiClient.get('/admin/bookings'),
  
  // Cancela um agendamento
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`)
};