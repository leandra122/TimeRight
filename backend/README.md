# TimeRight Backend - Sistema de Login e Cadastro

Backend completo com autenticação JWT para o sistema TimeRight.

## 🚀 Como usar

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Iniciar servidor:**
```bash
npm start
```

3. **Servidor rodará em:** http://localhost:5000

## 🔐 Credenciais de Teste

- **Admin:** admin@timeright.com / admin123
- **Usuário:** maria@email.com / 123456

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado

### Saúde da API
- `GET /api/health` - Status do servidor

## 📝 Exemplo de Uso

### Cadastro:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@email.com","password":"123456"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@timeright.com","password":"admin123"}'
```

## 🛠️ Tecnologias

- Node.js + Express
- SQLite3 (banco local)
- JWT (autenticação)
- bcryptjs (criptografia)
- CORS (cross-origin)

## 📊 Banco de Dados

SQLite com tabela `users`:
- id (PRIMARY KEY)
- name (TEXT)
- email (UNIQUE)
- password (HASH)
- role (user/admin)
- created_at (TIMESTAMP)