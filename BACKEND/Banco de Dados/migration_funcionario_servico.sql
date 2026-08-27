SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Funcionario', N'U') IS NULL
        THROW 50100, 'A tabela dbo.Funcionario nao existe.', 1;

    IF OBJECT_ID(N'dbo.Servico', N'U') IS NULL
        THROW 50101, 'A tabela dbo.Servico nao existe.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UX_Funcionario_IdSalao'
          AND object_id = OBJECT_ID(N'dbo.Funcionario')
    )
        CREATE UNIQUE INDEX UX_Funcionario_IdSalao
            ON dbo.Funcionario(id, salao_id);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UX_Servico_IdSalao'
          AND object_id = OBJECT_ID(N'dbo.Servico')
    )
        CREATE UNIQUE INDEX UX_Servico_IdSalao
            ON dbo.Servico(id, salao_id);

    IF OBJECT_ID(N'dbo.FuncionarioServico', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.FuncionarioServico (
            funcionario_id INT NOT NULL,
            servico_id INT NOT NULL,
            salao_id INT NOT NULL,
            CONSTRAINT PK_FuncionarioServico
                PRIMARY KEY (funcionario_id, servico_id)
        );
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_FuncionarioServico_FuncionarioSalao'
          AND parent_object_id = OBJECT_ID(N'dbo.FuncionarioServico')
    )
    BEGIN
        ALTER TABLE dbo.FuncionarioServico WITH CHECK
            ADD CONSTRAINT FK_FuncionarioServico_FuncionarioSalao
            FOREIGN KEY (funcionario_id, salao_id)
            REFERENCES dbo.Funcionario(id, salao_id);
        ALTER TABLE dbo.FuncionarioServico
            CHECK CONSTRAINT FK_FuncionarioServico_FuncionarioSalao;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_FuncionarioServico_ServicoSalao'
          AND parent_object_id = OBJECT_ID(N'dbo.FuncionarioServico')
    )
    BEGIN
        ALTER TABLE dbo.FuncionarioServico WITH CHECK
            ADD CONSTRAINT FK_FuncionarioServico_ServicoSalao
            FOREIGN KEY (servico_id, salao_id)
            REFERENCES dbo.Servico(id, salao_id);
        ALTER TABLE dbo.FuncionarioServico
            CHECK CONSTRAINT FK_FuncionarioServico_ServicoSalao;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'IX_FuncionarioServico_Funcionario'
          AND object_id = OBJECT_ID(N'dbo.FuncionarioServico')
    )
        CREATE INDEX IX_FuncionarioServico_Funcionario
            ON dbo.FuncionarioServico(funcionario_id);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'IX_FuncionarioServico_Servico'
          AND object_id = OBJECT_ID(N'dbo.FuncionarioServico')
    )
        CREATE INDEX IX_FuncionarioServico_Servico
            ON dbo.FuncionarioServico(servico_id);

    INSERT INTO dbo.FuncionarioServico (funcionario_id, servico_id, salao_id)
    SELECT f.id, s.id, f.salao_id
    FROM dbo.Funcionario AS f
    INNER JOIN dbo.Servico AS s ON s.salao_id = f.salao_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.FuncionarioServico AS fs
        WHERE fs.funcionario_id = f.id
          AND fs.servico_id = s.id
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
