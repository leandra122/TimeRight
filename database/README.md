# Banco de Dados - Time Right

## 📊 Estrutura do Banco

### Tabelas Principais

#### 🔐 **admins**
- Administradores do sistema
- Campos: id, name, email, password, active, created_at

#### 📋 **categories** 
- Categorias de serviços
- Campos: id, name, description, active, created_at

#### 👥 **professionals**
- Profissionais do salão
- Campos: id, name, specialty, phone, email, active, created_at

#### 💼 **services**
- Serviços oferecidos
- Campos: id, category_id, name, description, price, duration_minutes, active, created_at

#### 👤 **clients**
- Clientes do salão
- Campos: id, name, email, phone, birth_date, active, created_at

#### 📅 **schedules**
- Agendamentos
- Campos: id, client_id, professional_id, service_id, schedule_date, schedule_time, status, notes, created_at

#### 🎯 **promotions**
- Promoções e ofertas
- Campos: id, title, description, price, discount_percent, valid_from, valid_until, active, created_at

## 🔗 Relacionamentos

- **services** → **categories** (N:1)
- **schedules** → **clients** (N:1)
- **schedules** → **professionals** (N:1)
- **schedules** → **services** (N:1)

## 📈 Índices

- IX_schedules_date
- IX_schedules_professional
- IX_schedules_client
- IX_services_category
- IX_admins_email
- IX_clients_email

## 🚀 Como Usar

1. Execute apenas `timeright_complete.sql` no SQL Server
2. Configure a conexão no `application.yml`
3. Inicie o backend Spring Boot

## 🔧 Configuração

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://servidor:porta;databaseName=timeright
    username: seu_usuario
    password: sua_senha
```