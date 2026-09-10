USE bd_timeright;
GO

-- =========================================================
-- Endereço estruturado + dados cadastrais do Salao
-- Complementa migration_salao_campos.sql (idempotente).
-- =========================================================

-- ---- Dados cadastrais provenientes da consulta de CNPJ ----
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'razao_social'
)
    ALTER TABLE Salao ADD razao_social VARCHAR(150) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'nome_fantasia'
)
    ALTER TABLE Salao ADD nome_fantasia VARCHAR(150) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'situacao_cadastral'
)
    ALTER TABLE Salao ADD situacao_cadastral VARCHAR(50) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'estabelecimento_verificado'
)
    ALTER TABLE Salao ADD estabelecimento_verificado BIT NOT NULL
        CONSTRAINT DF_Salao_EstabelecimentoVerificado DEFAULT 0;
GO

-- ---- Endereço estruturado (necessário para cadastro e mapa) ----
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'cep'
)
    ALTER TABLE Salao ADD cep VARCHAR(9) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'logradouro'
)
    ALTER TABLE Salao ADD logradouro VARCHAR(150) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'numero'
)
    ALTER TABLE Salao ADD numero VARCHAR(20) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'complemento'
)
    ALTER TABLE Salao ADD complemento VARCHAR(100) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'bairro'
)
    ALTER TABLE Salao ADD bairro VARCHAR(100) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'cidade'
)
    ALTER TABLE Salao ADD cidade VARCHAR(100) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'uf'
)
    ALTER TABLE Salao ADD uf VARCHAR(2) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Salao' AND COLUMN_NAME = 'ponto_referencia'
)
    ALTER TABLE Salao ADD ponto_referencia VARCHAR(150) NULL;
GO

SELECT id, nome, cep, logradouro, numero, complemento, bairro, cidade, uf, ponto_referencia
FROM Salao;
GO
