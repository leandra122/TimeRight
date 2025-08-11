# TimeRight Backend API

Backend Node.js + Express + SQLite para sistema de agendamento de salão de beleza.

## 🚀 Tecnologias

- Node.js 18+
- Express.js
- SQLite3
- JWT Authentication
- bcryptjs
- CORS

## 📦 Instalação

```bash
cd backend
npm install
```

## 🔧 Configuração

1. Configure as variáveis de ambiente no `.env`:
```
PORT=5000
JWT_SECRET=timeright_jwt_secret_key_2024
NODE_ENV=development
```

## 🏃‍♂️ Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Banco de Dados

SQLite com tabelas:
- `users` - Usuários e admins
- `services` - Serviços do salão
- `professionals` - Profissionais
- `bookings` - Agendamentos

## 🔐 Autenticação

- **Admin padrão**: admin@timeright.com / password
- JWT token válido por 7 dias
- Middleware de autenticação para rotas protegidas

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login

### Services
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço (admin)
- `PUT /api/services/:id` - Atualizar serviço (admin)
- `DELETE /api/services/:id` - Deletar serviço (admin)

### Professionals
- `GET /api/professionals` - Listar profissionais
- `GET /api/professionals/:id/availability` - Disponibilidade
- `POST /api/professionals` - Criar profissional (admin)

### Bookings
- `POST /api/bookings` - Criar agendamento
- `GET /api/bookings` - Agendamentos do usuário
- `GET /api/bookings/admin` - Todos agendamentos (admin)
- `PUT /api/bookings/:id/cancel` - Cancelar agendamento

## 🚀 Deploy

### Railway
1. Conecte o repositório
2. Configure variáveis de ambiente
3. Deploy automático

### Render
1. Conecte o repositório
2. Configure build command: `npm install`
3. Configure start command: `npm start`
4. Configure variáveis de ambiente