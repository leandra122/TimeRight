-- La Belle Vie Database Schema
-- Sistema de Gerenciamento de Salão de Beleza

-- Tabela de Administradores
CREATE TABLE admins (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tabela de Categorias de Serviços
CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tabela de Profissionais
CREATE TABLE professionals (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    specialty NVARCHAR(255),
    phone NVARCHAR(20),
    email NVARCHAR(255),
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tabela de Serviços
CREATE TABLE services (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    price DECIMAL(10,2),
    duration_minutes INT,
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabela de Clientes
CREATE TABLE clients (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    phone NVARCHAR(20),
    birth_date DATE,
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tabela de Agendamentos
CREATE TABLE schedules (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    client_id BIGINT NOT NULL,
    professional_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    schedule_date DATE NOT NULL,
    schedule_time TIME NOT NULL,
    status NVARCHAR(50) DEFAULT 'Agendado',
    notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Tabela de Promoções
CREATE TABLE promotions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    valid_from DATE,
    valid_until DATE,
    active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Índices para melhor performance
CREATE INDEX IX_schedules_date ON schedules(schedule_date);
CREATE INDEX IX_schedules_professional ON schedules(professional_id);
CREATE INDEX IX_schedules_client ON schedules(client_id);
CREATE INDEX IX_services_category ON services(category_id);
CREATE INDEX IX_admins_email ON admins(email);
CREATE INDEX IX_clients_email ON clients(email);