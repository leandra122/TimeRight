-- La Belle Vie - Banco de Dados Completo
-- Sistema de Gerenciamento de Salão de Beleza

-- ========================================
-- CRIAÇÃO DAS TABELAS
-- ========================================

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

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IX_schedules_date ON schedules(schedule_date);
CREATE INDEX IX_schedules_professional ON schedules(professional_id);
CREATE INDEX IX_schedules_client ON schedules(client_id);
CREATE INDEX IX_services_category ON services(category_id);
CREATE INDEX IX_admins_email ON admins(email);
CREATE INDEX IX_clients_email ON clients(email);

-- ========================================
-- INSERÇÃO DOS DADOS INICIAIS
-- ========================================

-- Inserir Admin padrão (senha: admin123)
INSERT INTO admins (name, email, password, active) VALUES 
('Administrador La Belle Vie', 'admin@labellevie.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- Inserir Categorias (8 registros)
INSERT INTO categories (name, description, active) VALUES 
('Cortes de Cabelo', 'Cortes modernos e clássicos', 1),
('Coloração', 'Tintura e mechas profissionais', 1),
('Tratamentos', 'Hidratação e reconstrução capilar', 1),
('Manicure e Pedicure', 'Cuidados com unhas das mãos e pés', 1),
('Sobrancelhas', 'Design e modelagem de sobrancelhas', 1),
('Estética Facial', 'Tratamentos faciais e limpeza de pele', 1),
('Barbearia', 'Serviços masculinos especializados', 1),
('Massoterapia', 'Massagens relaxantes e terapêuticas', 1);

-- Inserir Profissionais (15 registros)
INSERT INTO professionals (name, specialty, phone, email, active) VALUES 
('Maria Silva', 'Colorista', '(11) 99999-1111', 'maria@labellevie.com', 1),
('João Santos', 'Cabeleireiro', '(11) 99999-2222', 'joao@labellevie.com', 1),
('Ana Costa', 'Manicure', '(11) 99999-3333', 'ana@labellevie.com', 1),
('Carlos Lima', 'Barbeiro', '(11) 99999-4444', 'carlos@labellevie.com', 1),
('Fernanda Rocha', 'Esteticista', '(11) 99999-5555', 'fernanda@labellevie.com', 1),
('Ricardo Alves', 'Cabeleireiro', '(11) 99999-6666', 'ricardo@labellevie.com', 1),
('Patrícia Mendes', 'Manicure', '(11) 99999-7777', 'patricia@labellevie.com', 1),
('Eduardo Ferreira', 'Barbeiro', '(11) 99999-8888', 'eduardo@labellevie.com', 1),
('Camila Souza', 'Colorista', '(11) 99999-9999', 'camila@labellevie.com', 1),
('Marcos Pereira', 'Cabeleireiro', '(11) 99999-0000', 'marcos@labellevie.com', 1),
('Juliana Martins', 'Esteticista', '(11) 98888-1234', 'juliana@labellevie.com', 1),
('André Oliveira', 'Barbeiro', '(11) 98888-5678', 'andre@labellevie.com', 1),
('Beatriz Cardoso', 'Manicure', '(11) 98888-9012', 'beatriz@labellevie.com', 1),
('Thiago Reis', 'Cabeleireiro', '(11) 98888-3456', 'thiago@labellevie.com', 1),
('Larissa Gomes', 'Colorista', '(11) 98888-7890', 'larissa@labellevie.com', 1);

-- Inserir Serviços (25 registros)
INSERT INTO services (category_id, name, description, price, duration_minutes, active) VALUES 
(1, 'Corte Feminino', 'Corte moderno para cabelos femininos', 45.00, 60, 1),
(1, 'Corte Masculino', 'Corte clássico e moderno masculino', 35.00, 45, 1),
(1, 'Corte Infantil', 'Corte especial para crianças', 30.00, 30, 1),
(1, 'Corte + Escova', 'Corte com finalização', 65.00, 90, 1),
(2, 'Coloração Completa', 'Tintura completa do cabelo', 120.00, 180, 1),
(2, 'Mechas', 'Mechas californianas ou tradicionais', 80.00, 120, 1),
(2, 'Luzes', 'Reflexos e luzes naturais', 90.00, 150, 1),
(2, 'Ombré Hair', 'Técnica de degradê', 150.00, 240, 1),
(3, 'Hidratação', 'Tratamento hidratante profundo', 60.00, 90, 1),
(3, 'Reconstrução', 'Reconstrução capilar intensiva', 85.00, 120, 1),
(3, 'Botox Capilar', 'Tratamento anti-idade para cabelos', 120.00, 180, 1),
(3, 'Cronograma Capilar', 'Tratamento completo 3 em 1', 100.00, 150, 1),
(4, 'Manicure Simples', 'Manicure tradicional', 25.00, 45, 1),
(4, 'Pedicure Completa', 'Pedicure com esfoliação', 35.00, 60, 1),
(4, 'Manicure Francesa', 'Manicure com acabamento francês', 35.00, 60, 1),
(4, 'Unhas em Gel', 'Aplicação de gel nas unhas', 45.00, 90, 1),
(5, 'Design de Sobrancelhas', 'Modelagem com pinça', 20.00, 30, 1),
(5, 'Henna nas Sobrancelhas', 'Tintura natural com henna', 30.00, 45, 1),
(5, 'Micropigmentação', 'Pigmentação semi-permanente', 200.00, 120, 1),
(6, 'Limpeza de Pele', 'Limpeza facial profunda', 80.00, 90, 1),
(6, 'Peeling Químico', 'Renovação celular', 120.00, 60, 1),
(7, 'Barba Completa', 'Corte e modelagem de barba', 25.00, 30, 1),
(7, 'Bigode', 'Aparar e modelar bigode', 15.00, 15, 1),
(8, 'Massagem Relaxante', 'Massagem para alívio do stress', 80.00, 60, 1),
(8, 'Drenagem Linfática', 'Massagem drenante', 100.00, 90, 1);

-- Inserir Clientes de exemplo (50 registros)
INSERT INTO clients (name, email, phone, birth_date, active) VALUES 
('Fernanda Oliveira', 'fernanda@email.com', '(11) 98888-1111', '1990-05-15', 1),
('Roberto Silva', 'roberto@email.com', '(11) 98888-2222', '1985-08-22', 1),
('Juliana Santos', 'juliana@email.com', '(11) 98888-3333', '1992-12-10', 1),
('Carla Mendes', 'carla@email.com', '(11) 98888-4444', '1988-03-20', 1),
('Pedro Costa', 'pedro@email.com', '(11) 98888-5555', '1995-07-12', 1),
('Amanda Lima', 'amanda@email.com', '(11) 98888-6666', '1987-11-08', 1),
('Lucas Ferreira', 'lucas@email.com', '(11) 98888-7777', '1993-09-25', 1),
('Beatriz Alves', 'beatriz@email.com', '(11) 98888-8888', '1991-01-30', 1),
('Rafael Souza', 'rafael@email.com', '(11) 98888-9999', '1989-06-18', 1),
('Camila Rocha', 'camila@email.com', '(11) 98888-0000', '1994-04-14', 1),
('Diego Martins', 'diego@email.com', '(11) 97777-1111', '1986-12-03', 1),
('Larissa Pereira', 'larissa@email.com', '(11) 97777-2222', '1992-08-27', 1),
('Thiago Barbosa', 'thiago@email.com', '(11) 97777-3333', '1990-10-16', 1),
('Natália Cardoso', 'natalia@email.com', '(11) 97777-4444', '1988-02-09', 1),
('Gustavo Reis', 'gustavo@email.com', '(11) 97777-5555', '1995-05-21', 1),
('Priscila Nunes', 'priscila@email.com', '(11) 97777-6666', '1987-09-13', 1),
('Marcelo Dias', 'marcelo@email.com', '(11) 97777-7777', '1993-03-07', 1),
('Vanessa Gomes', 'vanessa@email.com', '(11) 97777-8888', '1991-11-24', 1),
('André Moreira', 'andre@email.com', '(11) 97777-9999', '1989-07-19', 1),
('Tatiane Cunha', 'tatiane@email.com', '(11) 97777-0000', '1994-01-11', 1),
('Felipe Araújo', 'felipe@email.com', '(11) 96666-1111', '1986-04-28', 1),
('Renata Vieira', 'renata@email.com', '(11) 96666-2222', '1992-12-15', 1),
('Bruno Teixeira', 'bruno@email.com', '(11) 96666-3333', '1990-08-06', 1),
('Patrícia Lopes', 'patricia@email.com', '(11) 96666-4444', '1988-10-22', 1),
('Rodrigo Melo', 'rodrigo@email.com', '(11) 96666-5555', '1995-02-17', 1),
('Aline Ribeiro', 'aline@email.com', '(11) 96666-6666', '1987-06-04', 1),
('Fábio Castro', 'fabio@email.com', '(11) 96666-7777', '1993-09-29', 1),
('Cristina Pinto', 'cristina@email.com', '(11) 96666-8888', '1991-05-12', 1),
('Leandro Correia', 'leandro@email.com', '(11) 96666-9999', '1989-01-26', 1),
('Simone Freitas', 'simone@email.com', '(11) 96666-0000', '1994-07-08', 1),
('Vinicius Ramos', 'vinicius@email.com', '(11) 95555-1111', '1986-11-14', 1),
('Mônica Santana', 'monica@email.com', '(11) 95555-2222', '1992-03-31', 1),
('Danilo Machado', 'danilo@email.com', '(11) 95555-3333', '1990-09-18', 1),
('Elaine Campos', 'elaine@email.com', '(11) 95555-4444', '1988-05-25', 1),
('Henrique Farias', 'henrique@email.com', '(11) 95555-5555', '1995-01-02', 1),
('Débora Monteiro', 'debora@email.com', '(11) 95555-6666', '1987-08-16', 1),
('César Carvalho', 'cesar@email.com', '(11) 95555-7777', '1993-12-23', 1),
('Luciana Borges', 'luciana@email.com', '(11) 95555-8888', '1991-04-09', 1),
('Márcio Duarte', 'marcio@email.com', '(11) 95555-9999', '1989-10-05', 1),
('Sabrina Moura', 'sabrina@email.com', '(11) 95555-0000', '1994-06-21', 1),
('Everton Siqueira', 'everton@email.com', '(11) 94444-1111', '1986-02-13', 1),
('Karina Batista', 'karina@email.com', '(11) 94444-2222', '1992-07-30', 1),
('Júlio Nascimento', 'julio@email.com', '(11) 94444-3333', '1990-11-17', 1),
('Adriana Fogaça', 'adriana@email.com', '(11) 94444-4444', '1988-03-04', 1),
('Robson Medeiros', 'robson@email.com', '(11) 94444-5555', '1995-09-11', 1),
('Cláudia Xavier', 'claudia@email.com', '(11) 94444-6666', '1987-01-28', 1),
('Sérgio Brandão', 'sergio@email.com', '(11) 94444-7777', '1993-05-15', 1),
('Mariana Godoy', 'mariana@email.com', '(11) 94444-8888', '1991-12-01', 1),
('Alexandre Paiva', 'alexandre@email.com', '(11) 94444-9999', '1989-08-24', 1),
('Rosana Tavares', 'rosana@email.com', '(11) 94444-0000', '1994-04-07', 1);

-- Inserir Promoções (10 registros)
INSERT INTO promotions (title, description, price, discount_percent, valid_from, valid_until, active) VALUES 
('Corte + Escova', 'Pacote completo com desconto especial', 89.90, 15.00, '2024-01-01', '2024-12-31', 1),
('Hidratação Premium', 'Tratamento completo para seus cabelos', 129.90, 20.00, '2024-01-01', '2024-12-31', 1),
('Manicure + Pedicure', 'Combo completo para suas unhas', 55.00, 10.00, '2024-01-01', '2024-06-30', 1),
('Pacote Noiva', 'Cabelo + Maquiagem + Unhas', 250.00, 25.00, '2024-01-01', '2024-12-31', 1),
('Dia da Mãe Especial', 'Todos os serviços com 30% off', 0.00, 30.00, '2024-05-01', '2024-05-31', 1),
('Combo Masculino', 'Corte + Barba + Sobrancelha', 65.00, 20.00, '2024-01-01', '2024-12-31', 1),
('Tratamento Capilar Completo', 'Hidratação + Reconstrução + Nutrição', 180.00, 35.00, '2024-01-01', '2024-06-30', 1),
('Promoção Estudante', '15% de desconto com carteirinha', 0.00, 15.00, '2024-01-01', '2024-12-31', 1),
('Black Friday Beauty', 'Todos os serviços pela metade do preço', 0.00, 50.00, '2024-11-25', '2024-11-29', 1),
('Natal Dourado', 'Pacotes especiais para as festas', 199.00, 40.00, '2024-12-01', '2024-12-31', 1);

-- Inserir Agendamentos de exemplo (30 registros)
INSERT INTO schedules (client_id, professional_id, service_id, schedule_date, schedule_time, status, notes) VALUES 
(1, 1, 3, '2024-01-15', '14:00:00', 'Agendado', 'Cliente prefere produtos sem sulfato'),
(2, 2, 2, '2024-01-15', '16:00:00', 'Confirmado', 'Corte degradê'),
(3, 3, 7, '2024-01-16', '10:00:00', 'Agendado', 'Esmalte vermelho'),
(4, 4, 1, '2024-01-16', '09:00:00', 'Confirmado', 'Corte repicado'),
(5, 5, 5, '2024-01-16', '15:30:00', 'Agendado', 'Hidratação intensiva'),
(6, 6, 2, '2024-01-17', '11:00:00', 'Confirmado', 'Corte chanel'),
(7, 7, 8, '2024-01-17', '13:30:00', 'Agendado', 'Pedicure com esmalte rosa'),
(8, 8, 1, '2024-01-17', '16:00:00', 'Confirmado', 'Corte social'),
(9, 9, 4, '2024-01-18', '10:30:00', 'Agendado', 'Mechas loiras'),
(10, 10, 6, '2024-01-18', '14:00:00', 'Confirmado', 'Reconstrução com botox'),
(11, 11, 9, '2024-01-18', '16:30:00', 'Agendado', 'Sobrancelha com henna'),
(12, 12, 2, '2024-01-19', '09:30:00', 'Confirmado', 'Corte long bob'),
(13, 13, 7, '2024-01-19', '11:00:00', 'Agendado', 'Manicure francesa'),
(14, 14, 1, '2024-01-19', '15:00:00', 'Confirmado', 'Corte militar'),
(15, 15, 3, '2024-01-20', '10:00:00', 'Agendado', 'Coloração castanho'),
(16, 1, 5, '2024-01-20', '13:30:00', 'Confirmado', 'Cronograma capilar'),
(17, 2, 8, '2024-01-20', '16:00:00', 'Agendado', 'Pedicure relaxante'),
(18, 3, 2, '2024-01-22', '09:00:00', 'Confirmado', 'Corte pixie'),
(19, 4, 4, '2024-01-22', '11:30:00', 'Agendado', 'Mechas coloridas'),
(20, 5, 6, '2024-01-22', '14:30:00', 'Confirmado', 'Tratamento anti-frizz'),
(21, 6, 9, '2024-01-23', '10:30:00', 'Agendado', 'Design + tintura'),
(22, 7, 1, '2024-01-23', '13:00:00', 'Confirmado', 'Corte samurai'),
(23, 8, 7, '2024-01-23', '15:30:00', 'Agendado', 'Manicure gel'),
(24, 9, 3, '2024-01-24', '09:30:00', 'Confirmado', 'Coloração ruiva'),
(25, 10, 5, '2024-01-24', '12:00:00', 'Agendado', 'Hidratação com óleo'),
(26, 11, 8, '2024-01-24', '14:30:00', 'Confirmado', 'Spa dos pés'),
(27, 12, 2, '2024-01-25', '10:00:00', 'Agendado', 'Corte assimétrico'),
(28, 13, 4, '2024-01-25', '13:30:00', 'Confirmado', 'Luzes platinadas'),
(29, 14, 6, '2024-01-25', '16:00:00', 'Agendado', 'Botox capilar'),
(30, 15, 9, '2024-01-26', '11:00:00', 'Confirmado', 'Micropigmentação');