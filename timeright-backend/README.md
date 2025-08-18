# TimeRight Backend

Backend administrativo completo para o sistema de agendamento TimeRight, desenvolvido em Node.js com Express.js e SQL Server.

## 🚀 Tecnologias Utilizadas

- **Node.js** + **Express.js** - Servidor web
- **SQL Server** + **Sequelize ORM** - Banco de dados
- **JWT** - Autenticação segura
- **Joi** - Validação de dados
- **Nodemailer** - Envio de emails
- **Swagger** - Documentação da API
- **Helmet** - Segurança HTTP
- **Rate Limiting** - Proteção contra ataques

## 📋 Funcionalidades

### ✅ Autenticação
- Login seguro com JWT
- Middleware de autenticação para todas as rotas
- Autorização apenas para administradores

### ✅ CRUD Completo
- **Categorias de Serviços**: Criar, listar, atualizar, excluir
- **Profissionais**: Gerenciar nome, especialidade, foto, categoria
- **Promoções**: Título, descrição, preço, validade
- **Agendas**: Datas e horários disponíveis por profissional

### ✅ Notificações
- Envio automático de emails via SMTP
- Notificações para criação/atualização de:
  - Profissionais
  - Promoções
  - Agendas

### ✅ Segurança
- Rate limiting (100 requests/15min)
- Validação rigorosa de dados
- Tratamento centralizado de erros
- Headers de segurança com Helmet

## 📦 Instalação e Configuração

### 1. Clonar e Instalar
```bash
git clone <repository-url>
cd timeright-backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database SQL Server
DB_HOST=localhost
DB_PORT=1433
DB_NAME=timeright
DB_USER=sa
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
JWT_EXPIRES_IN=24h

# Email SMTP (Gmail exemplo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# Server
PORT=3001
NODE_ENV=development
```

### 3. Configurar Banco de Dados

**Pré-requisitos:**
- SQL Server instalado e rodando
- Banco de dados `timeright` criado

**Executar Migrations e Seeders:**
```bash
# Executar migrations (criar tabelas)
npm run db:migrate

# Executar seeders (dados iniciais)
npm run db:seed

# Ou resetar tudo de uma vez
npm run db:reset
```

### 4. Iniciar Servidor
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

## 🔐 Credenciais Padrão

**Administrador:**
- **Email:** admin@timeright.com
- **Senha:** admin123

## 📚 Documentação da API

### Swagger UI
Acesse: `http://localhost:3001/api-docs`

### Endpoints Principais

#### Autenticação
```
POST /api/auth/login     - Login do administrador
GET  /api/auth/me        - Dados do admin logado
```

#### Categorias
```
GET    /api/categories     - Listar categorias
GET    /api/categories/:id - Buscar por ID
POST   /api/categories     - Criar categoria
PUT    /api/categories/:id - Atualizar categoria
DELETE /api/categories/:id - Excluir categoria
```

#### Profissionais
```
GET    /api/professionals     - Listar profissionais
GET    /api/professionals/:id - Buscar por ID
POST   /api/professionals     - Criar profissional
PUT    /api/professionals/:id - Atualizar profissional
DELETE /api/professionals/:id - Excluir profissional
```

#### Promoções
```
GET    /api/promotions     - Listar promoções
GET    /api/promotions/:id - Buscar por ID
POST   /api/promotions     - Criar promoção
PUT    /api/promotions/:id - Atualizar promoção
DELETE /api/promotions/:id - Excluir promoção
```

#### Agendas
```
GET    /api/schedules     - Listar horários (com filtros)
GET    /api/schedules/:id - Buscar por ID
POST   /api/schedules     - Criar horário
PUT    /api/schedules/:id - Atualizar horário
DELETE /api/schedules/:id - Excluir horário
```

### Filtros de Agenda
```
GET /api/schedules?professionalId=1&date=2024-12-01&available=true
```

## 🧪 Testando a API

### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@timeright.com",
    "password": "admin123"
  }'
```

### 2. Usar Token nas Requisições
```bash
curl -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Criar Categoria
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Massagem",
    "description": "Serviços de massagem relaxante"
  }'
```

## 📁 Estrutura do Projeto

```
timeright-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuração SQL Server
│   │   └── swagger.js       # Configuração Swagger
│   ├── controllers/         # Lógica de negócio
│   │   ├── AuthController.js
│   │   ├── CategoryController.js
│   │   ├── ProfessionalController.js
│   │   ├── PromotionController.js
│   │   └── ScheduleController.js
│   ├── middlewares/         # Middlewares
│   │   ├── auth.js          # Autenticação JWT
│   │   ├── validation.js    # Validação Joi
│   │   └── errorHandler.js  # Tratamento de erros
│   ├── models/              # Models Sequelize
│   │   ├── index.js
│   │   ├── Admin.js
│   │   ├── Category.js
│   │   ├── Professional.js
│   │   ├── Promotion.js
│   │   └── Schedule.js
│   ├── routes/              # Rotas da API
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── professionals.js
│   │   ├── promotions.js
│   │   └── schedules.js
│   ├── services/            # Serviços
│   │   └── emailService.js  # Envio de emails
│   └── app.js               # Aplicação principal
├── migrations/              # Migrations do banco
├── seeders/                 # Seeders (dados iniciais)
├── uploads/                 # Arquivos enviados
├── .env.example            # Template de variáveis
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
npm start           # Iniciar em produção
npm run dev         # Iniciar em desenvolvimento
npm run db:migrate  # Executar migrations
npm run db:seed     # Executar seeders
npm run db:reset    # Resetar banco (migrate + seed)
```

## 🚀 Deploy em Produção

### 1. Configurar Variáveis de Ambiente
```env
NODE_ENV=production
DB_HOST=seu_servidor_sql_producao
JWT_SECRET=chave_jwt_super_forte_producao
SMTP_HOST=seu_smtp_producao
```

### 2. Executar Migrations
```bash
npm run db:migrate
npm run db:seed
```

### 3. Iniciar Aplicação
```bash
npm start
```

## 🛡️ Segurança

- **JWT** com expiração configurável
- **Rate Limiting** para prevenir ataques
- **Helmet** para headers de segurança
- **Validação rigorosa** de todos os dados
- **Sanitização** de inputs
- **CORS** configurado
- **Senhas hasheadas** com bcrypt

## 📧 Configuração de Email

### Gmail
1. Ativar autenticação de 2 fatores
2. Gerar senha de app
3. Usar a senha de app no `.env`

### Outros Provedores
Ajustar `SMTP_HOST` e `SMTP_PORT` conforme o provedor.

## 🐛 Troubleshooting

### Erro de Conexão SQL Server
- Verificar se o SQL Server está rodando
- Confirmar credenciais no `.env`
- Verificar se o banco `timeright` existe

### Erro de JWT
- Verificar se `JWT_SECRET` está definido
- Token pode ter expirado (fazer login novamente)

### Erro de Email
- Verificar credenciais SMTP
- Para Gmail, usar senha de app

## 📞 Suporte

Para dúvidas ou problemas:
- Verificar logs do servidor
- Consultar documentação Swagger
- Verificar configurações do `.env`

## 📄 Licença

Este projeto está sob a licença MIT.