// API de agendamentos - gerenciamento de bookings
import apiClient from './client';

export const bookingsAPI = {
  // Cria novo agendamento
  create: (booking) => apiClient.post('/bookings', booking),
  
  // Lista agendamentos do usuário logado
  getUserBookings: () => apiClient.get('/bookings'),
  
  // Lista todos os agendamentos (admin)
  getAllBookings: () => apiClient.get('/admin/bookings')
};