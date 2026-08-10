import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const api = axios.create({ baseURL: `${BASE_URL}/usuarios` });

// ========================
// USUÁRIO
// ========================
export const listarUsuario = () => api.get('');
export const listarUsuarios = () => api.get('');
export const listarClientes = () => api.get('/clientes');
export const buscarUsuario = (id) => api.get(`/${id}`);
export const atualizarUsuario = (id, dados) => api.put(`/${id}`, dados);
export const excluirUsuario = (id) => api.delete(`/${id}`);
export const atualizarStatusUsuario = (id, status) => api.patch(`/${id}/status`, { status });
export const login = (dados) => api.post('/login', dados);

// ========================
// SALÃO
// ========================
const salaoApi = axios.create({ baseURL: `${BASE_URL}/saloes` });
export const listarSaloes = () => salaoApi.get('');
export const buscarSalao = (id) => salaoApi.get(`/${id}`);
export const atualizarSalao = (id, dados) => salaoApi.put(`/${id}`, dados);
export const consultarCnpj = (cnpj) => salaoApi.get(`/cnpj/${cnpj}`);

// ========================
// SERVIÇO
// ========================
const servicoApi = axios.create({ baseURL: `${BASE_URL}/servicos` });
export const listarServicos = () => servicoApi.get('');
export const buscarServico = (id) => servicoApi.get(`/${id}`);
export const listarServicosPorSalao = (salaoId) => servicoApi.get(`/salao/${salaoId}`);

// ========================
// FUNCIONÁRIO
// ========================
const funcionarioApi = axios.create({ baseURL: `${BASE_URL}/funcionarios` });
export const listarFuncionarios = () => funcionarioApi.get('');
export const buscarFuncionario = (id) => funcionarioApi.get(`/${id}`);
export const cadastrarFuncionario = (salaoId, dados) => funcionarioApi.post(`/${salaoId}`, dados);
export const atualizarFuncionario = (id, dados) => funcionarioApi.put(`/${id}`, dados);
export const atualizarStatusFuncionario = (id, status) => funcionarioApi.patch(`/${id}/status`, { status });
export const excluirFuncionario = (id) => funcionarioApi.delete(`/${id}`);

// ========================
// AGENDAMENTO
// ========================
const agendamentoApi = axios.create({ baseURL: `${BASE_URL}/agendamentos` });
export const listarAgendamentos = () => agendamentoApi.get('');
export const listarAgendamentosPorUsuario = (usuarioId) => agendamentoApi.get(`/usuario/${usuarioId}`);
export const buscarAgendamento = (id) => agendamentoApi.get(`/${id}`);
export const cadastrarAgendamento = (dados) => agendamentoApi.post('', dados);
export const atualizarAgendamento = (id, dados) => agendamentoApi.put(`/${id}`, dados);
export const cancelarAgendamento = (id) => agendamentoApi.patch(`/${id}/cancelar`);
export const excluirAgendamento = (id) => agendamentoApi.delete(`/${id}`);

// ========================
// AVALIAÇÕES
// ========================
const avaliacaoApi = axios.create({ baseURL: `${BASE_URL}/avaliacoes` });
export const listarAvaliacoesPorSalao = (salaoId) => avaliacaoApi.get(`/salao/${salaoId}`);
export const listarAvaliacoesPorUsuario = (usuarioId) => avaliacaoApi.get(`/usuario/${usuarioId}`);
export const criarAvaliacao = (dados) => avaliacaoApi.post('', dados);

// ========================
// DASHBOARD
// ========================
const dashboardApi = axios.create({ baseURL: `${BASE_URL}/dashboard` });
export const getDashboardStats = () => dashboardApi.get('/stats');
export const getPlataformaStats = () => dashboardApi.get('/stats/plataforma');
export const getSalaoStats = (salaoId) => dashboardApi.get(`/stats/salao/${salaoId}`);
