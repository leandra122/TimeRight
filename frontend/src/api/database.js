// API para integração com banco bd_timeright
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://cuddly-doodle-x5v5x45w6xpgcvxvj-8080.app.github.dev',
  headers: {
    'Content-Type': 'application/json'
  }
});

// API para Usuários (tabela Usuario)
export const usuariosAPI = {
  getAll: () => apiClient.get('/api/usuarios'),
  create: (userData) => apiClient.post('/api/usuarios', userData),
  update: (id, userData) => apiClient.put(`/api/usuarios/${id}`, userData),
  delete: (id) => apiClient.delete(`/api/usuarios/${id}`)
};

// API para Clientes (tabela Cliente)
export const clientesAPI = {
  getAll: () => apiClient.get('/api/clientes'),
  create: (clientData) => apiClient.post('/api/clientes', clientData),
  update: (id, clientData) => apiClient.put(`/api/clientes/${id}`, clientData),
  delete: (id) => apiClient.delete(`/api/clientes/${id}`)
};

// API para Funcionários (tabela Funcionario)
export const funcionariosAPI = {
  getAll: () => apiClient.get('/api/funcionarios'),
  create: (funcData) => apiClient.post('/api/funcionarios', funcData),
  update: (id, funcData) => apiClient.put(`/api/funcionarios/${id}`, funcData),
  delete: (id) => apiClient.delete(`/api/funcionarios/${id}`)
};

// API para Serviços (tabela Servico)
export const servicosAPI = {
  getAll: () => apiClient.get('/api/servicos'),
  create: (serviceData) => apiClient.post('/api/servicos', serviceData),
  update: (id, serviceData) => apiClient.put(`/api/servicos/${id}`, serviceData),
  delete: (id) => apiClient.delete(`/api/servicos/${id}`)
};

// API para Agendamentos (tabela Agendamento)
export const agendamentosAPI = {
  getAll: () => apiClient.get('/api/agendamentos'),
  create: (agendData) => apiClient.post('/api/agendamentos', agendData),
  update: (id, agendData) => apiClient.put(`/api/agendamentos/${id}`, agendData),
  delete: (id) => apiClient.delete(`/api/agendamentos/${id}`)
};

// API para Agenda (tabela Agenda)
export const agendaAPI = {
  getAll: () => apiClient.get('/api/agenda'),
  getByFuncionario: (funcionarioId) => apiClient.get(`/api/agenda/funcionario/${funcionarioId}`),
  create: (agendaData) => apiClient.post('/api/agenda', agendaData)
};

// API para Funcionário-Serviço (tabela FuncionarioServico)
export const funcionarioServicosAPI = {
  getAll: () => apiClient.get('/api/funcionario-servicos'),
  getByFuncionario: (funcionarioId) => apiClient.get(`/api/funcionario-servicos/funcionario/${funcionarioId}`),
  create: (data) => apiClient.post('/api/funcionario-servicos', data)
};