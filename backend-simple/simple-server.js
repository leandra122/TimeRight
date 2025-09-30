const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Endpoints para usuários (tabela Usuario)
app.get('/api/usuarios', (req, res) => {
  res.json([
    { id: 1, nome: 'Fulano da Silva', email: 'fulano@email.com.br', nivelAcesso: 'ADMIN', statusUsuario: 'ATIVO', dataCadastro: new Date() },
    { id: 2, nome: 'Beltrana de Sá', email: 'beltrana@email.com.br', nivelAcesso: 'USER', statusUsuario: 'ATIVO', dataCadastro: new Date() },
    { id: 3, nome: 'Sicrana de Oliveira', email: 'sicrana@email.com.br', nivelAcesso: 'USER', statusUsuario: 'INATIVO', dataCadastro: new Date() },
    { id: 4, nome: 'Ordnael Zurc', email: 'ordnael@email.com.br', nivelAcesso: 'USER', statusUsuario: 'TROCAR_SENHA', dataCadastro: new Date() }
  ]);
});

app.post('/api/usuarios', (req, res) => {
  const { nome, email, senha, nivelAcesso } = req.body;
  res.json({ 
    id: Date.now(), 
    nome, 
    email, 
    senha: 'MTIzNDU2Nzg=', // Base64 encoded
    nivelAcesso: nivelAcesso || 'USER',
    dataCadastro: new Date(),
    statusUsuario: 'ATIVO'
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if ((email === 'admin@timeright.com' && password === 'admin123') || 
      (email === 'fulano@email.com.br' && password === '12345678')) {
    res.json({
      message: 'Login realizado com sucesso',
      token: 'fake-token-123',
      admin: {
        id: 1,
        name: email === 'fulano@email.com.br' ? 'Fulano da Silva' : 'Administrador Time Right',
        email: email
      }
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Endpoints para clientes (tabela Cliente)
app.get('/api/clientes', (req, res) => {
  res.json([
    { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-1111', email: 'maria@email.com', dataNascimento: '1990-05-15', statusCliente: 'ATIVO' },
    { id: 2, nome: 'João Santos', telefone: '(11) 99999-2222', email: 'joao@email.com', dataNascimento: '1985-08-22', statusCliente: 'ATIVO' }
  ]);
});

app.post('/api/clientes', (req, res) => {
  const { nome, telefone, email, dataNascimento } = req.body;
  res.json({ 
    id: Date.now(), 
    nome, 
    telefone, 
    email, 
    dataNascimento,
    statusCliente: 'ATIVO'
  });
});

// Endpoints para funcionários (tabela Funcionario)
app.get('/api/funcionarios', (req, res) => {
  res.json([
    { id: 1, nome: 'Ana Costa', telefone: '(11) 98888-1111', email: 'ana@salon.com', dataNascimento: '1988-03-20', statusFuncionario: 'ATIVO' },
    { id: 2, nome: 'Carlos Lima', telefone: '(11) 98888-2222', email: 'carlos@salon.com', dataNascimento: '1992-07-15', statusFuncionario: 'ATIVO' }
  ]);
});

app.post('/api/funcionarios', (req, res) => {
  const { nome, telefone, email, dataNascimento } = req.body;
  res.json({ 
    id: Date.now(), 
    nome, 
    telefone, 
    email, 
    dataNascimento,
    statusFuncionario: 'ATIVO'
  });
});

// Endpoints para serviços (tabela Servico)
app.get('/api/servicos', (req, res) => {
  res.json([
    { id: 1, nome: 'Corte Feminino', descricao: 'Corte moderno para cabelos femininos', duracao: '60 min', statusServico: 'ATIVO' },
    { id: 2, nome: 'Manicure', descricao: 'Cuidados completos para as unhas', duracao: '45 min', statusServico: 'ATIVO' },
    { id: 3, nome: 'Coloração', descricao: 'Tintura profissional', duracao: '120 min', statusServico: 'ATIVO' }
  ]);
});

app.post('/api/servicos', (req, res) => {
  const { nome, descricao, duracao } = req.body;
  res.json({ 
    id: Date.now(), 
    nome, 
    descricao, 
    duracao,
    statusServico: 'ATIVO'
  });
});

// Endpoints para agendamentos (tabela Agendamento)
app.get('/api/agendamentos', (req, res) => {
  res.json([
    { 
      id: 1, 
      clienteId: 1, 
      funcionarioId: 1, 
      servicoId: 1, 
      dataAgendada: '2024-01-15', 
      horaAgendada: '14:00', 
      dataAgendamento: new Date(), 
      observacoes: 'Cliente preferencial',
      statusAgendamento: 'confirmado'
    }
  ]);
});

app.post('/api/agendamentos', (req, res) => {
  const { clienteId, funcionarioId, servicoId, dataAgendada, horaAgendada, observacoes } = req.body;
  res.json({ 
    id: Date.now(), 
    clienteId, 
    funcionarioId, 
    servicoId, 
    dataAgendada, 
    horaAgendada,
    dataAgendamento: new Date(),
    observacoes,
    statusAgendamento: 'pendente'
  });
});

// Endpoint para agenda (tabela Agenda)
app.get('/api/agenda', (req, res) => {
  res.json([
    { id: 1, funcionarioId: 1, dataAgenda: '2024-01-15', horaAgenda: '09:00:00', ocupado: false },
    { id: 2, funcionarioId: 1, dataAgenda: '2024-01-15', horaAgenda: '10:00:00', ocupado: true }
  ]);
});

// Endpoint para funcionario-servico (tabela FuncionarioServico)
app.get('/api/funcionario-servicos', (req, res) => {
  res.json([
    { id: 1, funcionarioId: 1, servicoId: 1, observacoes: 'Especialista em cortes', statusServico: 'ATIVO' },
    { id: 2, funcionarioId: 2, servicoId: 2, observacoes: 'Expert em manicure', statusServico: 'ATIVO' }
  ]);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});