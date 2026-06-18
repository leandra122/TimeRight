USE bd_timeright;
GO

DROP TABLE IF EXISTS Agendamento;
DROP TABLE IF EXISTS Funcionario;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Servico;
DROP TABLE IF EXISTS NivelAcesso;
DROP TABLE IF EXISTS Salao;
GO

CREATE TABLE NivelAcesso (
    id INT IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE Usuario (
    id INT IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    data_cadastro SMALLDATETIME NOT NULL,
    data_atualizacao SMALLDATETIME NULL,
    nivel_acesso_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT FK_Usuario_NivelAcesso FOREIGN KEY (nivel_acesso_id) REFERENCES NivelAcesso(id)
);

CREATE TABLE Salao (
    id INT IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE Servico (
    id INT IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(300) NOT NULL,
    duracao VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE Funcionario (
    id INT IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    servico_id INT NOT NULL,
    observacoes VARCHAR(225),
    status VARCHAR(20) NOT NULL,
    CONSTRAINT FK_Funcionario_Servico FOREIGN KEY (servico_id) REFERENCES Servico(id)
);

CREATE TABLE Agendamento (
    id INT IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_hora SMALLDATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT FK_Agendamento_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id),
    CONSTRAINT FK_Agendamento_Funcionario FOREIGN KEY (funcionario_id) REFERENCES Funcionario(id),
    CONSTRAINT FK_Agendamento_Servico FOREIGN KEY (servico_id) REFERENCES Servico(id)
);
GO

CREATE TRIGGER trg_agendamento_cliente
ON Agendamento
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN Usuario u ON i.usuario_id = u.id
        JOIN NivelAcesso n ON u.nivel_acesso_id = n.id
        WHERE UPPER(n.nome) <> 'CLIENTE'
    )
    BEGIN
        RAISERROR('Apenas clientes podem realizar agendamentos.', 16, 1);
        RETURN;
    END

    INSERT INTO Agendamento (usuario_id, funcionario_id, servico_id, data_hora, status)
    SELECT usuario_id, funcionario_id, servico_id, data_hora, status FROM inserted;
END;
GO

INSERT INTO NivelAcesso (nome, status)
VALUES ('ADMIN','ATIVO'),('CLIENTE','ATIVO');

INSERT INTO Usuario (nome, username, password, data_cadastro, nivel_acesso_id, status)
VALUES
('leandra','leadm','12345678',GETDATE(),1,'ATIVO'),
('laura','lisadm','12345678',GETDATE(),2,'ATIVO');

INSERT INTO Salao (nome,endereco,telefone,status)
VALUES ('Salão Belle Vie','Rua A, 123','(11) 99999-9999','ATIVO');

INSERT INTO Servico (nome,descricao,duracao,status)
VALUES ('Corte','Corte de cabelo','30min','ATIVO'),('Manicure','Cuidado com unhas','45min','ATIVO');

INSERT INTO Funcionario (nome,email,senha,servico_id,observacoes,status)
VALUES ('Maria','maria@email.com','123',1,'Teste','ATIVO'),
       ('Joao','joao@email.com','123',2,'Teste','ATIVO');

INSERT INTO Agendamento (usuario_id, funcionario_id, servico_id, data_hora, status)
VALUES (3,1,1,GETDATE(),'ATIVO');

select * from Usuario
select * from NivelAcesso
select * from Salao
select * from Servico
select * from Funcionario
select * from Agendamento

GO