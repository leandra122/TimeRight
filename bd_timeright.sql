USE bd_timeright;
GO


-- DROP 
DROP TABLE IF EXISTS Avaliacao;
DROP TABLE IF EXISTS Agendamento;
DROP TABLE IF EXISTS FuncionarioServico;
DROP TABLE IF EXISTS Funcionario;
DROP TABLE IF EXISTS Servico;
DROP TABLE IF EXISTS HorarioFuncionamentoSalao;
DROP TABLE IF EXISTS Salao;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS NivelAcesso;
GO

-- NÍVEL DE ACESSO
CREATE TABLE NivelAcesso (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);

INSERT INTO NivelAcesso (nome, status)
VALUES
('adm', 'ATIVO'),
('manager', 'ATIVO'),
('user', 'ATIVO'),
('employee', 'ATIVO');
GO


-- USUÁRIO
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

-- SALÃO
CREATE TABLE Salao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    gerente_id INT NULL,
    antecedencia_minima_minutos INT NOT NULL
        CONSTRAINT DF_Salao_AntecedenciaMinimaMinutos DEFAULT (120),
    limite_agendamento_dias INT NOT NULL
        CONSTRAINT DF_Salao_LimiteAgendamentoDias DEFAULT (60),

    CONSTRAINT FK_Salao_Gerente
        FOREIGN KEY (gerente_id)
        REFERENCES Usuario(id),
    CONSTRAINT CK_Salao_AntecedenciaMinimaMinutos
        CHECK (antecedencia_minima_minutos BETWEEN 0 AND 10080),
    CONSTRAINT CK_Salao_LimiteAgendamentoDias
        CHECK (limite_agendamento_dias BETWEEN 1 AND 365)
);
CREATE INDEX IX_Salao_GerenteId ON Salao(gerente_id);
GO

-- HORÁRIOS DE FUNCIONAMENTO DO SALÃO
CREATE TABLE HorarioFuncionamentoSalao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    salao_id INT NOT NULL,
    dia_semana INT NOT NULL,
    hora_inicio TIME(0) NOT NULL,
    hora_fim TIME(0) NOT NULL,

    CONSTRAINT FK_HorarioFuncionamentoSalao_Salao
        FOREIGN KEY (salao_id) REFERENCES Salao(id) ON DELETE CASCADE,
    CONSTRAINT CK_HorarioFuncionamentoSalao_DiaSemana
        CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT CK_HorarioFuncionamentoSalao_Intervalo
        CHECK (hora_inicio < hora_fim)
);
CREATE UNIQUE INDEX UX_HorarioFuncionamentoSalao_Periodo
    ON HorarioFuncionamentoSalao(salao_id, dia_semana, hora_inicio, hora_fim);
CREATE INDEX IX_HorarioFuncionamentoSalao_SalaoDia
    ON HorarioFuncionamentoSalao(salao_id, dia_semana, hora_inicio);
GO

-- SERVIÇO
CREATE TABLE Servico (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(300),
    preco DECIMAL(10,2) NOT NULL,
    duracao INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    salao_id INT NOT NULL,

    CONSTRAINT UX_Servico_IdSalao UNIQUE (id, salao_id),

    CONSTRAINT FK_Servico_Salao
        FOREIGN KEY (salao_id)
        REFERENCES Salao(id)
        ON DELETE CASCADE
);
GO

-- FUNCIONÁRIO
CREATE TABLE Funcionario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    observacoes VARCHAR(225),
    funcao VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    salao_id INT NOT NULL,
    usuario_id INT NULL,

    CONSTRAINT UX_Funcionario_IdSalao UNIQUE (id, salao_id),

    CONSTRAINT FK_Funcionario_Salao
        FOREIGN KEY (salao_id)
        REFERENCES Salao(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Funcionario_Usuario
        FOREIGN KEY (usuario_id)
        REFERENCES Usuario(id)
);
CREATE UNIQUE INDEX UX_Funcionario_UsuarioId
    ON Funcionario(usuario_id)
    WHERE usuario_id IS NOT NULL;
GO

-- ATRIBUICAO FUNCIONARIO-SERVICO
CREATE TABLE FuncionarioServico (
    funcionario_id INT NOT NULL,
    servico_id INT NOT NULL,
    salao_id INT NOT NULL,

    CONSTRAINT PK_FuncionarioServico
        PRIMARY KEY (funcionario_id, servico_id),

    CONSTRAINT FK_FuncionarioServico_FuncionarioSalao
        FOREIGN KEY (funcionario_id, salao_id)
        REFERENCES Funcionario(id, salao_id),

    CONSTRAINT FK_FuncionarioServico_ServicoSalao
        FOREIGN KEY (servico_id, salao_id)
        REFERENCES Servico(id, salao_id)
);
CREATE INDEX IX_FuncionarioServico_Funcionario
    ON FuncionarioServico(funcionario_id);
CREATE INDEX IX_FuncionarioServico_Servico
    ON FuncionarioServico(servico_id);
GO

-- AGENDAMENTO
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

-- TABELA AVALIACAO
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

-- TRIGGER (regra de negócio)
-- SOMENTE USER PODE AGENDAR
CREATE OR ALTER TRIGGER dbo.trg_agendamento_user
ON dbo.Agendamento
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        LEFT JOIN dbo.Usuario AS u ON i.usuario_id = u.id
        LEFT JOIN dbo.NivelAcesso AS n ON u.nivel_acesso_id = n.id
        WHERE u.id IS NULL
           OR n.id IS NULL
           OR UPPER(LTRIM(RTRIM(n.nome))) <> 'USER'
    )
    BEGIN
        ;THROW 50001, 'Apenas usuários do tipo USER podem realizar agendamentos.', 1;
    END;
END;
GO


SELECT * FROM NivelAcesso;
SELECT * FROM Usuario;
SELECT * FROM Salao;
SELECT * FROM Servico;
SELECT * FROM Funcionario;
SELECT * FROM FuncionarioServico;
SELECT * FROM Agendamento;
SELECT * FROM Avaliacao;
GO
