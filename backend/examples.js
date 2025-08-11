// Exemplos de uso da API TimeRight
// Execute este arquivo com: node examples.js

const API_BASE = 'http://localhost:5000/api';

// Exemplo 1: Cadastro de usuário
async function exemploRegistro() {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@email.com',
        password: '123456',
        phone: '(11) 99999-8888'
      })
    });

    const data = await response.json();
    console.log('📝 Cadastro:', data);
    
    if (data.success) {
      console.log('✅ Token recebido:', data.token);
      return data.token;
    }
  } catch (error) {
    console.error('❌ Erro no cadastro:', error);
  }
}

// Exemplo 2: Login
async function exemploLogin() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@timeright.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('🔐 Login:', data);
    
    if (data.success) {
      console.log('✅ Token recebido:', data.token);
      return data.token;
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
  }
}

// Exemplo 3: Validar token (verificar se usuário está logado)
async function exemploValidarToken(token) {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('👤 Dados do usuário:', data);
  } catch (error) {
    console.error('❌ Erro na validação:', error);
  }
}

// Exemplo 4: Listar serviços
async function exemploListarServicos() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    const data = await response.json();
    console.log('💅 Serviços disponíveis:', data);
  } catch (error) {
    console.error('❌ Erro ao listar serviços:', error);
  }
}

// Exemplo 5: Criar agendamento
async function exemploAgendamento(token) {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 1,
        professional_id: 1,
        booking_date: '2024-12-25',
        booking_time: '14:00',
        notes: 'Primeira vez no salão'
      })
    });

    const data = await response.json();
    console.log('📅 Agendamento:', data);
  } catch (error) {
    console.error('❌ Erro no agendamento:', error);
  }
}

// Exemplo 6: Listar meus agendamentos
async function exemploMeusAgendamentos(token) {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('📋 Meus agendamentos:', data);
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
  }
}

// Executar exemplos
async function executarExemplos() {
  console.log('🚀 Testando API TimeRight...\n');

  // 1. Login
  const token = await exemploLogin();
  
  if (token) {
    // 2. Validar token
    await exemploValidarToken(token);
    
    // 3. Listar serviços
    await exemploListarServicos();
    
    // 4. Criar agendamento
    await exemploAgendamento(token);
    
    // 5. Listar agendamentos
    await exemploMeusAgendamentos(token);
  }
}

// Exemplo com Axios (alternativa ao fetch)
const exemploComAxios = `
// Instalar: npm install axios
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Login
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error.response.data);
  }
};

// Cadastro
const register = async (name, email, password, phone) => {
  try {
    const response = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Erro no cadastro:', error.response.data);
  }
};

// Criar agendamento
const createBooking = async (serviceId, professionalId, date, time) => {
  try {
    const response = await api.post('/bookings', {
      service_id: serviceId,
      professional_id: professionalId,
      booking_date: date,
      booking_time: time
    });
    return response.data;
  } catch (error) {
    console.error('Erro no agendamento:', error.response.data);
  }
};
`;

console.log('📖 Exemplo com Axios:');
console.log(exemploComAxios);

// Executar se chamado diretamente
if (require.main === module) {
  executarExemplos();
}