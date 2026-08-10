USE bd_timeright;
GO

-- =========================
-- DROP SEGURO
-- =========================
DROP TABLE IF EXISTS Agendamento;
DROP TABLE IF EXISTS Funcionario;
DROP TABLE IF EXISTS Servico;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS NivelAcesso;
DROP TABLE IF EXISTS Salao;
GO

-- =========================
-- NÍVEL DE ACESSO
-- =========================
CREATE TABLE NivelAcesso (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);

INSERT INTO NivelAcesso (nome, status)
VALUES
('adm', 'ATIVO'),
('manager', 'ATIVO'),
('user', 'ATIVO');
GO

-- =========================
-- USUÁRIO
-- =========================
CREATE TABLE Usuario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    data_cadastro DATETIME2 NOT NULL,
    data_atualizacao DATETIME2 NULL,

    nivel_acesso_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,

    reset_token VARCHAR(255) NULL,
    reset_token_expiracao DATETIME2 NULL,

    CONSTRAINT FK_Usuario_NivelAcesso
        FOREIGN KEY (nivel_acesso_id)
        REFERENCES NivelAcesso(id)
);
GO

-- =========================
-- SALÃO
-- =========================
CREATE TABLE Salao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

-- =========================
-- SERVIÇO
-- =========================
CREATE TABLE Servico (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(300),
    preco DECIMAL(10,2) NOT NULL,
    duracao INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    salao_id INT NOT NULL,

    CONSTRAINT FK_Servico_Salao
        FOREIGN KEY (salao_id)
        REFERENCES Salao(id)
        ON DELETE CASCADE
);
GO

-- =========================
-- FUNCIONÁRIO
-- =========================
CREATE TABLE Funcionario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    observacoes VARCHAR(225),
    funcao VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    salao_id INT NOT NULL,

    CONSTRAINT FK_Funcionario_Salao
        FOREIGN KEY (salao_id)
        REFERENCES Salao(id)
        ON DELETE CASCADE
);
GO

-- =========================
-- AGENDAMENTO
-- =========================
CREATE TABLE Agendamento (
    id INT IDENTITY(1,1) PRIMARY KEY,

    usuario_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    servico_id INT NOT NULL,

    data_hora DATETIME2 NOT NULL,
    duracao INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    observacoes VARCHAR(255) NULL,

    CONSTRAINT FK_Agendamento_Usuario
        FOREIGN KEY (usuario_id)
        REFERENCES Usuario(id),

    CONSTRAINT FK_Agendamento_Funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES Funcionario(id),

    CONSTRAINT FK_Agendamento_Servico
        FOREIGN KEY (servico_id)
        REFERENCES Servico(id)
);
GO

-- =========================
-- TABELA AVALIACAO
-- =========================
CREATE TABLE Avaliacao (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id      INT NOT NULL,
    salao_id        INT NOT NULL,
    agendamento_id  INT NOT NULL UNIQUE,
    nota            INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario      VARCHAR(500) NULL,
    data_avaliacao  DATETIME2 NOT NULL,

    CONSTRAINT FK_Avaliacao_Usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario(id),

    CONSTRAINT FK_Avaliacao_Salao
        FOREIGN KEY (salao_id) REFERENCES Salao(id),

    CONSTRAINT FK_Avaliacao_Agendamento
        FOREIGN KEY (agendamento_id) REFERENCES Agendamento(id)
);
GO

-- =========================
-- TRIGGER (regra de negócio)
-- SOMENTE USER PODE AGENDAR
-- =========================
CREATE TRIGGER trg_agendamento_user
ON Agendamento
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN Usuario u ON i.usuario_id = u.id
        INNER JOIN NivelAcesso n ON u.nivel_acesso_id = n.id
        WHERE UPPER(n.nome) <> 'USER'
    )
    BEGIN
        RAISERROR('Apenas usuários do tipo USER podem realizar agendamentos.',16,1);
        RETURN;
    END

    INSERT INTO Agendamento
    (
        usuario_id,
        funcionario_id,
        servico_id,
        data_hora,
        duracao,
        status
    )
    SELECT
        usuario_id,
        funcionario_id,
        servico_id,
        data_hora,
        duracao,
        status
    FROM inserted;
END;
GO

-- =========================
-- CONSULTAS
-- =========================
SELECT * FROM NivelAcesso;
SELECT * FROM Usuario;
SELECT * FROM Salao;
SELECT * FROM Servico;
SELECT * FROM Funcionario;
SELECT * FROM Agendamento;
GO