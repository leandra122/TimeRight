# La Belle Vie - Salão de Beleza

Site institucional e funcional de agendamento online para salões de beleza, desenvolvido em React com Vite.

## 🚀 Funcionalidades

- **Sistema de Agendamento**: Seleção de serviço → profissional → data/horário → confirmação
- **Autenticação**: Login e cadastro para clientes e administradores
- **Dashboard Admin**: CRUD para serviços, profissionais e visualização de agendamentos
- **Perfil do Usuário**: Histórico de agendamentos e gerenciamento de dados
- **Design Responsivo**: Otimizado para desktop e mobile
- **Paleta de Cores**: Azul-marinho (#153360) e branco (#FFFFFF)

## 📱 Páginas

1. **Home** - Landing page com hero section e CTAs
2. **Sobre** - Informações sobre o salão
3. **Serviços** - Lista de serviços com filtros por categoria
4. **Profissionais** - Lista de profissionais com especialidades
5. **Agendamento** - Sistema de booking em 4 etapas
6. **Login/Cadastro** - Autenticação de usuários
7. **Dashboard Admin** - Painel administrativo completo
8. **Perfil** - Área do usuário com histórico
9. **Contato** - Formulário de contato e informações

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Roteamento**: React Router DOM
- **HTTP Client**: Axios
- **Datas**: Day.js
- **Estilização**: CSS personalizado com variáveis
- **Mock Server**: JSON Server (desenvolvimento)
- **Testes**: Jest + React Testing Library

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd La-Belle-Vie
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
# Inicia apenas o frontend
npm run dev

# Inicia frontend + backend mock
npm run dev:full
```

## 🚀 Deploy no Vercel

1. **Build do projeto**:
```bash
npm run build
```

2. **Deploy via Vercel CLI**:
```bash
npm i -g vercel
vercel --prod
```

3. **Configurar variáveis de ambiente no Vercel**:
   - `VITE_API_BASE_URL`: URL da API de produção

4. **Deploy via GitHub**:
   - Conecte o repositório ao Vercel
   - Configure as variáveis de ambiente
   - Deploy automático a cada push

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm test -- --watch
```

## 📁 Estrutura do Projeto

```
src/
├── api/           # Configuração Axios e endpoints
├── assets/        # Imagens e recursos estáticos
├── components/    # Componentes reutilizáveis
├── hooks/         # Custom hooks (useAuth)
├── pages/         # Páginas da aplicação
├── routes/        # Componentes de rota (PrivateRoute, AdminRoute)
├── utils/         # Funções utilitárias
└── __tests__/     # Testes unitários
```

## 🔐 Autenticação

### Usuários de Teste:
- **Admin**: admin@labellevie.com / admin123
- **Cliente**: maria@email.com / 123456

### Fluxo de Autenticação:
1. Login/Cadastro via formulário
2. JWT token armazenado no localStorage
3. Interceptor Axios adiciona token automaticamente
4. Rotas protegidas verificam autenticação

## 📊 API Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Cadastro de usuário

### Serviços
- `GET /services` - Listar serviços
- `POST /services` - Criar serviço (admin)

### Profissionais
- `GET /professionals` - Listar profissionais
- `GET /professionals/:id/availability` - Disponibilidade
- `POST /professionals` - Criar profissional (admin)

### Agendamentos
- `POST /bookings` - Criar agendamento
- `GET /bookings` - Listar agendamentos do usuário
- `GET /admin/bookings` - Listar todos (admin)
- `PUT /bookings/:id/cancel` - Cancelar agendamento

## 🎨 Design System

### Cores
- **Primary**: #153360 (Azul-marinho)
- **Secondary**: #FFFFFF (Branco)
- **Text**: #333333

### Tipografia
- **Font Family**: system-ui, Avenir, Helvetica, Arial, sans-serif
- **Weights**: 300, 400, 500, 600, 700

### Componentes
- **Border Radius**: 8px
- **Shadow**: 0 2px 8px rgba(21, 51, 96, 0.1)
- **Breakpoints**: Mobile-first design

## ✅ Checklist de QA

- [ ] Build `npm run build` gera bundle sem erros
- [ ] Navegação entre todas as páginas funciona
- [ ] Login/Cadastro funcionam corretamente
- [ ] Sistema de agendamento completo
- [ ] Dashboard admin operacional
- [ ] Layout responsivo em mobile e desktop
- [ ] Paleta de cores aplicada consistentemente
- [ ] Formulários com validação
- [ ] Autenticação e autorização funcionando

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run rebuild` - Limpa e reconstrói o projeto
- `npm run start` - Preview do build
- `npm run server` - Servidor mock (JSON Server)
- `npm run dev:full` - Frontend + Backend mock
- `npm test` - Executar testes

## 📝 Próximos Passos

1. **Integração com Backend Real**
   - Substituir JSON Server por API real
   - Implementar autenticação JWT completa
   - Adicionar validações server-side

2. **Melhorias de UX**
   - Notificações push
   - Integração com calendário
   - Sistema de avaliações

3. **Funcionalidades Avançadas**
   - Pagamento online
   - Notificações por email/SMS
   - Relatórios avançados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.