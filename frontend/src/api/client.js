import axios from 'axios'

const API_BASE_URL = 'https://cuddly-doodle-x5v5x45w6xpgcvxvj-8080.app.github.dev'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

export const professionalsAPI = {
  getAll: () => api.get('/professionals'),
  create: (data) => api.post('/professionals', data),
  update: (id, data) => api.put(`/professionals/${id}`, data),
  delete: (id) => api.delete(`/professionals/${id}`)
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
}

export default api