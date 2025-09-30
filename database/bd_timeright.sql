USE master 
IF EXISTS(select * from sys.databases where name='bd_timeright') 
DROP DATABASE bd_timeright 
GO 
-- CRIAR UM BANCO DE DADOS
CREATE DATABASE bd_timeright 
GO
-- ACESSAR O BANCO DE DADOS
USE bd_timeright
GO
 
CREATE TABLE Usuario
( 
   id            INT			IDENTITY,
   nome          VARCHAR(100)	NOT NULL,
   email         VARCHAR(100)	UNIQUE NOT NULL,
   senha         VARCHAR(100)	NOT NULL,
   nivelAcesso   VARCHAR(10)    NULL, -- ADMIN ou OPERADOR PROFISSIONAL CLIENTE 
   foto			 VARBINARY(MAX) NULL,
   dataCadastro	 SMALLDATETIME	NOT NULL,
   statusUsuario VARCHAR(20)    NOT NULL, -- ATIVO ou INATIVO ou TROCAR_SENHA
 
   PRIMARY KEY (id)
)
GO
INSERT Usuario (nome, email, senha, nivelAcesso, foto, dataCadastro, statusUsuario)
VALUES ('Fulano da Silva', 'fulano@email.com.br', 'MTIzNDU2Nzg=', 'ADMIN', NULL, GETDATE(), 'ATIVO')
INSERT Usuario (nome, email, senha, nivelAcesso, foto, dataCadastro, statusUsuario)
VALUES ('Beltrana de Sá', 'beltrana@email.com.br', 'MTIzNDU2Nzg=', 'USER', NULL, GETDATE(), 'ATIVO')
INSERT Usuario (nome, email, senha, nivelAcesso, foto, dataCadastro, statusUsuario)
VALUES ('Sicrana de Oliveira', 'sicrana@email.com.br', 'MTIzNDU2Nzg=', 'USER', NULL, GETDATE(), 'INATIVO')
INSERT Usuario (nome, email, senha, nivelAcesso, foto, dataCadastro, statusUsuario)
VALUES ('Ordnael Zurc', 'ordnael@email.com.br', 'MTIzNDU2Nzg=', 'USER', NULL, GETDATE(), 'TROCAR_SENHA')
GO
 
 
CREATE TABLE Servico 
(
	  id INT      IDENTITY,
	  nome        VARCHAR (100)   NOT NULL,
	  descricao   VARCHAR (300)   NULL,
	  duracao     VARCHAR (20)    NOT NULL, 
      statusServico VARCHAR (20)  NOT NULL,
 
	  PRIMARY KEY (id) 
)
  CREATE TABLE Cliente
 
  (
    id INT  IDENTITY, 
    nome VARCHAR (100)  NOT NULL, 
	telefone  VARCHAR (50) NOT NULL,
	email VARCHAR (100) NULL, 
	dataNascimento DATE NULL,
	usuarioId INT NULL,
	statusCliente  VARCHAR (20)  NOT NULL, 
     PRIMARY KEY (id),
	 FOREIGN KEY (usuarioId) REFERENCES Usuario(id),
  )

 
	CREATE TABLE Funcionario 
(
     id INT IDENTITY,
	 nome VARCHAR (100) NOT NULL, 
	 telefone  VARCHAR (50) NOT NULL,
	email VARCHAR (100) NULL, 
	dataNascimento DATE NULL, 
	usuarioId INT NULL,
	statusFuncionario  VARCHAR (20)  NOT NULL, 
     PRIMARY KEY (id),
	 FOREIGN KEY (usuarioId) REFERENCES Usuario(id),
)
 
  CREATE TABLE FuncionarioServico 
(
	id  INT  IDENTITY,
	funcionarioId INT, 
	servicoId   INT, 
	observacoes VARCHAR (225),
	statusServico VARCHAR (20),
 
	PRIMARY KEY (id),
    FOREIGN KEY (servicoId) REFERENCES Servico(id),
	FOREIGN KEY (funcionarioId) REFERENCES Funcionario(id)
)

 
CREATE TABLE Agendamento 
(
	id  INT  IDENTITY,
	clienteId  INT,
	funcionarioId INT, 
	servicoId   INT, 
	dataAgendada DATE NOT NULL, 
	horaAgendada CHAR (5) NOT NULL, -- 00:00
	dataAgendamento  DATETIME   NOT NULL, 
	observacoes VARCHAR (225),
	statusAgendamento VARCHAR (20)  DEFAULT 'pendente',
 
	PRIMARY KEY (id),
	FOREIGN KEY (clienteId) REFERENCES Cliente(id),
    FOREIGN KEY (servicoId) REFERENCES Servico(id),
	FOREIGN KEY (funcionarioId) REFERENCES Funcionario(id)
)
 
 
CREATE TABLE Agenda 
(
   id INT IDENTITY,
   funcionarioId INT NOT NULL,
   dataAgenda  DATE NOT NULL, 
   horaAgenda TIME NOT NULL, 
   ocupado bit DEFAULT 0, 

 
  PRIMARY KEY (id),
  FOREIGN KEY (funcionarioId) REFERENCES Funcionario(id)
)
 
 
SELECT * FROM Agendamento 
SELECT * FROM Agenda
SELECT * FROM Funcionario 
SELECT * FROM Cliente 
SELECT * FROM Servico 
SELECT * FROM Usuario