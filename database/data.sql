-- Dados iniciais para La Belle Vie

-- Inserir Admin padrão
INSERT INTO admins (name, email, password, active) VALUES 
('Administrador La Belle Vie', 'admin@labellevie.com', '$2a$10$encrypted_password_hash', 1);

-- Inserir Categorias
INSERT INTO categories (name, description, active) VALUES 
('Cortes de Cabelo', 'Cortes modernos e clássicos', 1),
('Coloração', 'Tintura e mechas profissionais', 1),
('Tratamentos', 'Hidratação e reconstrução capilar', 1),
('Manicure e Pedicure', 'Cuidados com unhas das mãos e pés', 1),
('Sobrancelhas', 'Design e modelagem de sobrancelhas', 1);

-- Inserir Profissionais
INSERT INTO professionals (name, specialty, phone, email, active) VALUES 
('Maria Silva', 'Colorista', '(11) 99999-1111', 'maria@labellevie.com', 1),
('João Santos', 'Cabeleireiro', '(11) 99999-2222', 'joao@labellevie.com', 1),
('Ana Costa', 'Manicure', '(11) 99999-3333', 'ana@labellevie.com', 1),
('Carlos Lima', 'Barbeiro', '(11) 99999-4444', 'carlos@labellevie.com', 1);

-- Inserir Serviços
INSERT INTO services (category_id, name, description, price, duration_minutes, active) VALUES 
(1, 'Corte Feminino', 'Corte moderno para cabelos femininos', 45.00, 60, 1),
(1, 'Corte Masculino', 'Corte clássico e moderno masculino', 35.00, 45, 1),
(2, 'Coloração Completa', 'Tintura completa do cabelo', 120.00, 180, 1),
(2, 'Mechas', 'Mechas californianas ou tradicionais', 80.00, 120, 1),
(3, 'Hidratação', 'Tratamento hidratante profundo', 60.00, 90, 1),
(3, 'Reconstrução', 'Reconstrução capilar intensiva', 85.00, 120, 1),
(4, 'Manicure Simples', 'Manicure tradicional', 25.00, 45, 1),
(4, 'Pedicure Completa', 'Pedicure com esfoliação', 35.00, 60, 1),
(5, 'Design de Sobrancelhas', 'Modelagem com pinça', 20.00, 30, 1);

-- Inserir Clientes de exemplo
INSERT INTO clients (name, email, phone, birth_date, active) VALUES 
('Fernanda Oliveira', 'fernanda@email.com', '(11) 98888-1111', '1990-05-15', 1),
('Roberto Silva', 'roberto@email.com', '(11) 98888-2222', '1985-08-22', 1),
('Juliana Santos', 'juliana@email.com', '(11) 98888-3333', '1992-12-10', 1);

-- Inserir Promoções
INSERT INTO promotions (title, description, price, discount_percent, valid_from, valid_until, active) VALUES 
('Corte + Escova', 'Pacote completo com desconto especial', 89.90, 15.00, '2024-01-01', '2024-12-31', 1),
('Hidratação Premium', 'Tratamento completo para seus cabelos', 129.90, 20.00, '2024-01-01', '2024-12-31', 1),
('Manicure + Pedicure', 'Combo completo para suas unhas', 55.00, 10.00, '2024-01-01', '2024-06-30', 1);

-- Inserir Agendamentos de exemplo
INSERT INTO schedules (client_id, professional_id, service_id, schedule_date, schedule_time, status, notes) VALUES 
(1, 1, 3, '2024-01-15', '14:00:00', 'Agendado', 'Cliente prefere produtos sem sulfato'),
(2, 2, 2, '2024-01-15', '16:00:00', 'Confirmado', 'Corte degradê'),
(3, 3, 7, '2024-01-16', '10:00:00', 'Agendado', 'Esmalte vermelho');