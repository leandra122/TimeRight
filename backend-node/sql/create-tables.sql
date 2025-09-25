-- Criar tabela PasswordReset
CREATE TABLE PasswordReset (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    codigo NVARCHAR(6) NOT NULL,
    expira_em DATETIME NOT NULL,
    usado BIT DEFAULT 0,
    criado_em DATETIME DEFAULT GETDATE()
);

-- Criar tabela admins (se não existir)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admins' AND xtype='U')
CREATE TABLE admins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Inserir admin padrão
IF NOT EXISTS (SELECT * FROM admins WHERE email = 'admin@timeright.com')
INSERT INTO admins (name, email, password) 
VALUES ('Administrador', 'admin@timeright.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');