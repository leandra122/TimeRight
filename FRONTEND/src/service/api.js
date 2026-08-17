import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes('/api/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.dispatchEvent(new Event('timeright:session-expired'));
    }
    return Promise.reject(error);
  },
);

// AUTENTICAÇÃO
export const login = (dados) => api.post('/api/auth/login', dados);
export const cadastrarGerente = (dados) => api.post('/usuarios', dados);

// USUÁRIO
export const listarUsuario = () => api.get('/usuarios');
export const listarUsuarios = () => api.get('/usuarios');
export const listarClientes = () => api.get('/usuarios/clientes');
export const buscarUsuario = (id) => api.get(`/usuarios/${id}`);
export const atualizarUsuario = (id, dados) => api.put(`/usuarios/${id}`, dados);
export const excluirUsuario = (id) => api.delete(`/usuarios/${id}`);
export const atualizarStatusUsuario = (id, status) => api.patch(`/usuarios/${id}/status`, { status });

// SALÃO
export const listarSaloes = () => api.get('/saloes');
export const listarMeusSaloes = () => api.get('/saloes/me');
export const buscarSalao = (id) => api.get(`/saloes/${id}`);
export const atualizarSalao = (id, dados) => api.put(`/saloes/${id}`, dados);
export const consultarCnpj = (cnpj) => api.get(`/saloes/cnpj/${cnpj}`);
export const cadastrarSalaoComServicos = (dados) => api.post('/saloes/com-servicos', dados);

// SERVIÇO
export const listarServicos = () => api.get('/servicos');
export const listarMeusServicos = () => api.get('/servicos/me');
export const buscarServico = (id) => api.get(`/servicos/${id}`);
export const listarServicosPorSalao = (salaoId) => api.get(`/servicos/salao/${salaoId}`);

// FUNCIONÁRIO
export const listarFuncionariosGlobais = () => api.get('/funcionarios');
export const listarMeusFuncionarios = () => api.get('/funcionarios/me');
export const listarFuncionarios = listarFuncionariosGlobais;
export const buscarFuncionario = (id) => api.get(`/funcionarios/${id}`);
export const cadastrarFuncionario = (salaoId, dados) => api.post(`/funcionarios/${salaoId}`, dados);
export const atualizarFuncionario = (id, dados) => api.put(`/funcionarios/${id}`, dados);
export const atualizarStatusFuncionario = (id, status) => api.patch(`/funcionarios/${id}/status`, { status });
export const excluirFuncionario = (id) => api.delete(`/funcionarios/${id}`);
export const listarMinhaAgendaFuncionario = () => api.get('/funcionarios/me/agendamentos');

// AGENDAMENTO
export const listarAgendamentosGlobais = () => api.get('/agendamentos');
export const listarMeusAgendamentos = () => api.get('/agendamentos/me');
export const listarAgendamentosPorUsuario = (usuarioId) => api.get(`/agendamentos/usuario/${usuarioId}`);
export const buscarAgendamento = (id) => api.get(`/agendamentos/${id}`);
export const cadastrarAgendamento = (dados) => api.post('/agendamentos', dados);
export const atualizarAgendamento = (id, dados) => api.put(`/agendamentos/${id}`, dados);
export const cancelarAgendamento = (id) => api.patch(`/agendamentos/${id}/cancelar`);
export const excluirAgendamento = (id) => api.delete(`/agendamentos/${id}`);

// AVALIAÇÕES
export const listarAvaliacoesPorSalao = (salaoId) => api.get(`/avaliacoes/salao/${salaoId}`);
export const listarAvaliacoesPorUsuario = (usuarioId) => api.get(`/avaliacoes/usuario/${usuarioId}`);
export const criarAvaliacao = (dados) => api.post('/avaliacoes', dados);

// DASHBOARD
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getPlataformaStats = () => api.get('/dashboard/stats/plataforma');
export const getSalaoStats = (salaoId) => api.get(`/dashboard/stats/salao/${salaoId}`);
