# Time Right - Sistema de Agendamento

Plataforma completa para gerenciamento de agendamentos com sistema administrativo e portal do cliente.

## 📁 Estrutura do Projeto

```
La-Belle-Vie/
├── frontend/          # React + Vite (localhost:5173)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── backend/           # Spring Boot Java (localhost:8080)
    ├── src/main/java/
    ├── src/main/resources/
    └── pom.xml
```

## 🎨 Frontend (React + Vite)

**Porta:** `localhost:5173`

### Executar Frontend
```bash
cd frontend
npm install
npm run dev
```

### Funcionalidades
- ✅ Sistema de autenticação admin
- ✅ Dashboard administrativo completo
- ✅ CRUD de categorias de serviços
- ✅ Gerenciamento de profissionais
- ✅ Sistema de promoções
- ✅ Controle de agendas
- ✅ Portal institucional
- ✅ Design responsivo Bootstrap

## ⚙️ Backend (Spring Boot Java)

**Porta:** `localhost:8080`

### Executar Backend
```bash
cd backend
mvn spring-boot:run
```

### API Endpoints

#### Autenticação
- `POST /api/auth/login` - Login administrativo
- `GET /api/auth/me` - Dados do admin logado

#### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/{id}` - Atualizar categoria
- `DELETE /api/categories/{id}` - Excluir categoria

#### Profissionais
- `GET /api/professionals` - Listar profissionais
- `POST /api/professionals` - Criar profissional
- `PUT /api/professionals/{id}` - Atualizar profissional
- `DELETE /api/professionals/{id}` - Excluir profissional

#### Promoções
- `GET /api/promotions` - Listar promoções
- `POST /api/promotions` - Criar promoção
- `PUT /api/promotions/{id}` - Atualizar promoção
- `DELETE /api/promotions/{id}` - Excluir promoção

#### Agendas
- `GET /api/schedules` - Listar horários
- `POST /api/schedules` - Criar horário
- `PUT /api/schedules/{id}` - Atualizar horário
- `DELETE /api/schedules/{id}` - Excluir horário

## 🗄️ Banco de Dados

- **H2 Database** (desenvolvimento)
- **JPA/Hibernate**
- **Configuração:** `application.yml`
- **Console H2:** `http://localhost:8080/h2-console`

### Credenciais H2
- **URL:** `jdbc:h2:mem:timeright`
- **User:** `sa`
- **Password:** (vazio)

## 🔐 Credenciais de Acesso

### Admin Padrão
- **Email:** `admin@timeright.com`
- **Senha:** `admin123`

## 🛠️ Tecnologias

### Frontend
- **React 18**
- **Vite 4**
- **Bootstrap 5**
- **React Router DOM**
- **React Bootstrap**
- **Axios**

### Backend
- **Spring Boot 3.2**
- **Spring Data JPA**
- **Spring Security**
- **JWT Authentication**
- **H2 Database**
- **Maven**
- **Swagger/OpenAPI**

## 🚀 Deploy

### Frontend
- **Vercel** (configurado)
- **Build:** `npm run build`
- **Porta produção:** Configurável

### Backend
- **Heroku/AWS**
- **Build:** `mvn clean package`
- **JAR:** `target/timeright-backend-1.0.0.jar`

## 📋 Funcionalidades Implementadas

### ✅ Sistema Administrativo
- Login seguro com JWT
- Dashboard com métricas
- CRUD completo de categorias
- Gerenciamento de profissionais
- Sistema de promoções
- Controle de horários/agendas

### ✅ Portal Institucional
- Página inicial atrativa
- Sobre o salão
- Lista de serviços
- Equipe de profissionais
- Formulário de contato

### ✅ Segurança
- Autenticação JWT
- Rotas protegidas
- Criptografia de senhas
- CORS configurado
- Validação de dados

## 🎯 Paleta de Cores

- **Primary:** `#153360` (Azul-marinho)
- **Secondary:** `#FFFFFF` (Branco)
- **Text:** `#333333` (Cinza escuro)

## 📱 Design Responsivo

- Mobile-first approach
- Bootstrap 5 components
- Layout adaptativo
- Navegação otimizada

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

#### Backend (application.yml)
```yaml
server:
  port: 8080
jwt:
  secret: timeright_super_secret_jwt_key_2024
  expiration: 86400000
```

## 📖 Documentação da API

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI Docs:** `http://localhost:8080/v3/api-docs`

## 🧪 Testes

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
mvn test
```

## 📦 Build para Produção

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
mvn clean package
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Time Right** - Sistema completo de agendamento online ⏰✨