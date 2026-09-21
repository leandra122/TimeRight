-- Compatibilidade com o banco existente da escola.
-- Executar somente mediante autorizacao, no banco bd_timeright.
-- Preserva as colunas camelCase existentes e todos os registros.
-- Nao executar migration_salao_endereco.sql como substituto deste arquivo.
SET XACT_ABORT ON;

IF DB_NAME() <> N'bd_timeright'
BEGIN
    THROW 50001, N'Selecione o banco bd_timeright antes de continuar.', 1;
END;

IF OBJECT_ID(N'dbo.Salao', N'U') IS NULL
BEGIN
    THROW 50002, N'Tabela dbo.Salao nao encontrada. Confira o esquema.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'bairro'
    )
        ALTER TABLE dbo.Salao ADD bairro VARCHAR(100) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'cep'
    )
        ALTER TABLE dbo.Salao ADD cep VARCHAR(9) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'cidade'
    )
        ALTER TABLE dbo.Salao ADD cidade VARCHAR(100) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'complemento'
    )
        ALTER TABLE dbo.Salao ADD complemento VARCHAR(100) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'logradouro'
    )
        ALTER TABLE dbo.Salao ADD logradouro VARCHAR(150) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'numero'
    )
        ALTER TABLE dbo.Salao ADD numero VARCHAR(20) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'ponto_referencia'
    )
        ALTER TABLE dbo.Salao ADD ponto_referencia VARCHAR(150) NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.Salao')
          AND name = N'uf'
    )
        ALTER TABLE dbo.Salao ADD uf VARCHAR(2) NULL;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- Conferencia do esquema apos a execucao autorizada.
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = N'dbo' AND TABLE_NAME = N'Salao'
ORDER BY ORDINAL_POSITION;