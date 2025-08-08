import apiClient from './client';

export const bookingsAPI = {
  create: (booking) => apiClient.post('/bookings', booking),
  getUserBookings: (userId) => apiClient.get('/bookings', { params: { userId } }),
  getAllBookings: () => apiClient.get('/admin/bookings'),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`)
};