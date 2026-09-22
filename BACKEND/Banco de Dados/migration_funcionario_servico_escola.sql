-- TimeRight | compatibilidade do banco existente da escola com FuncionarioServico.salao_id
-- SCRIPT PREPARADO, NAO EXECUTADO. Exige autorizacao, backup e janela sem escritas.
-- Nao executar bd_timeright.sql: esse arquivo contem DROP TABLE.
-- Preserva os vinculos existentes e as FKs simples; adiciona verificacao de mesmo salao.
-- Executar apenas no banco bd_timeright, apos revisao por responsavel pelo banco.
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF DB_NAME() <> N'bd_timeright'
    THROW 50200, N'Selecione o banco bd_timeright antes de executar.', 1;

IF OBJECT_ID(N'dbo.Funcionario', N'U') IS NULL
    OR OBJECT_ID(N'dbo.Servico', N'U') IS NULL
    OR OBJECT_ID(N'dbo.FuncionarioServico', N'U') IS NULL
    THROW 50201, N'Uma das tabelas Funcionario, Servico ou FuncionarioServico nao existe.', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Interrompe antes de qualquer mudanca se houver vinculos orfaos ou entre saloes distintos.
    IF EXISTS (
        SELECT 1
        FROM dbo.FuncionarioServico AS fs
        LEFT JOIN dbo.Funcionario AS f ON f.id = fs.funcionario_id
        LEFT JOIN dbo.Servico AS s ON s.id = fs.servico_id
        WHERE f.id IS NULL OR s.id IS NULL
           OR f.salao_id IS NULL OR s.salao_id IS NULL
           OR f.salao_id <> s.salao_id
    )
        THROW 50202, N'Ha vinculos orfaos ou entre saloes diferentes; nenhuma alteracao aplicada.', 1;

    IF COL_LENGTH(N'dbo.FuncionarioServico', N'salao_id') IS NULL
        ALTER TABLE dbo.FuncionarioServico ADD salao_id INT NULL;

    -- SQL dinamico: a coluna pode ter acabado de ser adicionada nesta mesma execucao.
    EXEC sys.sp_executesql N'
        IF EXISTS (
            SELECT 1
            FROM dbo.FuncionarioServico AS fs
            JOIN dbo.Funcionario AS f ON f.id = fs.funcionario_id
            WHERE fs.salao_id IS NOT NULL AND fs.salao_id <> f.salao_id
        )
            THROW 50203, N''salao_id existente diverge do funcionario; nenhuma alteracao aplicada.'', 1;

        UPDATE fs SET salao_id = f.salao_id
        FROM dbo.FuncionarioServico AS fs
        JOIN dbo.Funcionario AS f ON f.id = fs.funcionario_id
        WHERE fs.salao_id IS NULL;

        IF EXISTS (SELECT 1 FROM dbo.FuncionarioServico WHERE salao_id IS NULL)
            THROW 50204, N''Ha salao_id nulo apos preenchimento; nenhuma alteracao aplicada.'', 1;
    ';

    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.FuncionarioServico')
          AND name = N'salao_id' AND is_nullable = 1
    )
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.FuncionarioServico ALTER COLUMN salao_id INT NOT NULL;
        ';

    -- SQL Server exige chave UNIQUE em (id, salao_id) para referenciar duas colunas.
    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Funcionario')
          AND name = N'UX_Funcionario_IdSalao'
    )
        CREATE UNIQUE INDEX UX_Funcionario_IdSalao
            ON dbo.Funcionario(id, salao_id);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.Servico')
          AND name = N'UX_Servico_IdSalao'
    )
        CREATE UNIQUE INDEX UX_Servico_IdSalao
            ON dbo.Servico(id, salao_id);

    -- Mantem FKs anteriores; adiciona FKs compostas para impedir vinculacao entre saloes.
    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID(N'dbo.FuncionarioServico')
          AND name = N'FK_FuncionarioServico_FuncionarioSalao'
    )
        ALTER TABLE dbo.FuncionarioServico WITH CHECK
            ADD CONSTRAINT FK_FuncionarioServico_FuncionarioSalao
            FOREIGN KEY (funcionario_id, salao_id)
            REFERENCES dbo.Funcionario(id, salao_id);

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID(N'dbo.FuncionarioServico')
          AND name = N'FK_FuncionarioServico_ServicoSalao'
    )
        ALTER TABLE dbo.FuncionarioServico WITH CHECK
            ADD CONSTRAINT FK_FuncionarioServico_ServicoSalao
            FOREIGN KEY (servico_id, salao_id)
            REFERENCES dbo.Servico(id, salao_id);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.FuncionarioServico')
          AND name = N'IX_FuncionarioServico_Funcionario'
    )
        CREATE INDEX IX_FuncionarioServico_Funcionario
            ON dbo.FuncionarioServico(funcionario_id);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.FuncionarioServico')
          AND name = N'IX_FuncionarioServico_Servico'
    )
        CREATE INDEX IX_FuncionarioServico_Servico
            ON dbo.FuncionarioServico(servico_id);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
go

-- Resultado de conferencia apenas apos aplicacao autorizada:
SELECT fs.funcionario_id, f.nome AS funcionario,
       fs.servico_id, s.nome AS servico, fs.salao_id
FROM dbo.FuncionarioServico AS fs
JOIN dbo.Funcionario AS f ON f.id = fs.funcionario_id
JOIN dbo.Servico AS s ON s.id = fs.servico_id
ORDER BY fs.funcionario_id, fs.servico_id;
