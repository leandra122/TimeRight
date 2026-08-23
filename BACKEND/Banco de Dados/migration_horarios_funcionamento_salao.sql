SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Salao', N'U') IS NULL
        THROW 50001, 'A tabela dbo.Salao nao existe.', 1;

    IF COL_LENGTH(N'dbo.Salao', N'id') IS NULL
        THROW 50002, 'A coluna dbo.Salao.id nao existe.', 1;

    IF OBJECT_ID(N'dbo.HorarioFuncionamentoSalao', N'U') IS NULL
    BEGIN
        EXEC sys.sp_executesql N'
            CREATE TABLE dbo.HorarioFuncionamentoSalao (
                id INT IDENTITY(1,1) NOT NULL,
                salao_id INT NOT NULL,
                dia_semana INT NOT NULL,
                hora_inicio TIME(0) NOT NULL,
                hora_fim TIME(0) NOT NULL,
                CONSTRAINT PK_HorarioFuncionamentoSalao PRIMARY KEY (id)
            );';
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND c.name = N'id' AND t.name = N'int'
          AND c.max_length = 4 AND c.is_nullable = 0 AND c.is_identity = 1
    )
        THROW 50003, 'A coluna dbo.HorarioFuncionamentoSalao.id e incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND c.name = N'salao_id' AND t.name = N'int'
          AND c.max_length = 4 AND c.is_nullable = 0
    )
        THROW 50004, 'A coluna dbo.HorarioFuncionamentoSalao.salao_id e incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND c.name = N'dia_semana' AND t.name = N'int'
          AND c.max_length = 4 AND c.is_nullable = 0
    )
        THROW 50005, 'A coluna dbo.HorarioFuncionamentoSalao.dia_semana e incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND c.name = N'hora_inicio' AND t.name = N'time'
          AND c.scale = 0 AND c.is_nullable = 0
    )
        THROW 50006, 'A coluna dbo.HorarioFuncionamentoSalao.hora_inicio e incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns c
        JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND c.name = N'hora_fim' AND t.name = N'time'
          AND c.scale = 0 AND c.is_nullable = 0
    )
        THROW 50007, 'A coluna dbo.HorarioFuncionamentoSalao.hora_fim e incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.key_constraints kc
        JOIN sys.index_columns ic
          ON ic.object_id = kc.parent_object_id
         AND ic.index_id = kc.unique_index_id
        JOIN sys.columns c
          ON c.object_id = ic.object_id
         AND c.column_id = ic.column_id
        WHERE kc.parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND kc.name = N'PK_HorarioFuncionamentoSalao'
          AND kc.type = N'PK' AND ic.key_ordinal = 1 AND c.name = N'id'
    )
        THROW 50008, 'A chave primaria PK_HorarioFuncionamentoSalao e incompativel ou nao existe.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys fk
        WHERE fk.name = N'FK_HorarioFuncionamentoSalao_Salao'
          AND (
              fk.parent_object_id <> OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
              OR fk.referenced_object_id <> OBJECT_ID(N'dbo.Salao')
          )
    )
        THROW 50009, 'FK_HorarioFuncionamentoSalao_Salao existe em uma estrutura incompativel.', 1;

    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys fk
        WHERE fk.name = N'FK_HorarioFuncionamentoSalao_Salao'
          AND fk.parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND (
              fk.referenced_object_id <> OBJECT_ID(N'dbo.Salao')
              OR fk.delete_referential_action_desc <> N'CASCADE'
              OR fk.is_disabled = 1 OR fk.is_not_trusted = 1
              OR NOT EXISTS (
                  SELECT 1
                  FROM sys.foreign_key_columns fkc
                  JOIN sys.columns pc
                    ON pc.object_id = fkc.parent_object_id
                   AND pc.column_id = fkc.parent_column_id
                  JOIN sys.columns rc
                    ON rc.object_id = fkc.referenced_object_id
                   AND rc.column_id = fkc.referenced_column_id
                  WHERE fkc.constraint_object_id = fk.object_id
                    AND pc.name = N'salao_id' AND rc.name = N'id'
              )
          )
    )
        THROW 50010, 'FK_HorarioFuncionamentoSalao_Salao existe com definicao incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_HorarioFuncionamentoSalao_Salao'
          AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
    BEGIN
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.HorarioFuncionamentoSalao WITH CHECK
                ADD CONSTRAINT FK_HorarioFuncionamentoSalao_Salao
                FOREIGN KEY (salao_id) REFERENCES dbo.Salao(id) ON DELETE CASCADE;
            ALTER TABLE dbo.HorarioFuncionamentoSalao
                CHECK CONSTRAINT FK_HorarioFuncionamentoSalao_Salao;';
    END;

    IF EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE name = N'CK_HorarioFuncionamentoSalao_DiaSemana'
          AND parent_object_id <> OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
        THROW 50011, 'CK_HorarioFuncionamentoSalao_DiaSemana existe em uma estrutura incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE name = N'CK_HorarioFuncionamentoSalao_DiaSemana'
          AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
    BEGIN
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.HorarioFuncionamentoSalao WITH CHECK
                ADD CONSTRAINT CK_HorarioFuncionamentoSalao_DiaSemana
                CHECK (dia_semana BETWEEN 1 AND 7);
            ALTER TABLE dbo.HorarioFuncionamentoSalao
                CHECK CONSTRAINT CK_HorarioFuncionamentoSalao_DiaSemana;';
    END;

    IF EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE name = N'CK_HorarioFuncionamentoSalao_Intervalo'
          AND parent_object_id <> OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
        THROW 50012, 'CK_HorarioFuncionamentoSalao_Intervalo existe em uma estrutura incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints
        WHERE name = N'CK_HorarioFuncionamentoSalao_Intervalo'
          AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
    BEGIN
        EXEC sys.sp_executesql N'
            ALTER TABLE dbo.HorarioFuncionamentoSalao WITH CHECK
                ADD CONSTRAINT CK_HorarioFuncionamentoSalao_Intervalo
                CHECK (hora_inicio < hora_fim);
            ALTER TABLE dbo.HorarioFuncionamentoSalao
                CHECK CONSTRAINT CK_HorarioFuncionamentoSalao_Intervalo;';
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes i
        WHERE i.name = N'UX_HorarioFuncionamentoSalao_Periodo'
          AND i.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND (
              i.is_unique = 0
              OR (
                  SELECT COUNT(*)
                  FROM sys.index_columns ic
                  WHERE ic.object_id = i.object_id
                    AND ic.index_id = i.index_id
                    AND ic.key_ordinal > 0
              ) <> 4
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 1 AND c.name = N'salao_id'
              )
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 2 AND c.name = N'dia_semana'
              )
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 3 AND c.name = N'hora_inicio'
              )
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 4 AND c.name = N'hora_fim'
              )
          )
    )
        THROW 50013, 'UX_HorarioFuncionamentoSalao_Periodo existe com definicao incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'UX_HorarioFuncionamentoSalao_Periodo'
          AND object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
    BEGIN
        EXEC sys.sp_executesql N'
            CREATE UNIQUE INDEX UX_HorarioFuncionamentoSalao_Periodo
                ON dbo.HorarioFuncionamentoSalao (
                    salao_id, dia_semana, hora_inicio, hora_fim
                );';
    END;

    IF EXISTS (
        SELECT 1
        FROM sys.indexes i
        WHERE i.name = N'IX_HorarioFuncionamentoSalao_SalaoDia'
          AND i.object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
          AND (
              i.is_unique = 1
              OR (
                  SELECT COUNT(*)
                  FROM sys.index_columns ic
                  WHERE ic.object_id = i.object_id
                    AND ic.index_id = i.index_id
                    AND ic.key_ordinal > 0
              ) <> 3
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 1 AND c.name = N'salao_id'
              )
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 2 AND c.name = N'dia_semana'
              )
              OR NOT EXISTS (
                  SELECT 1 FROM sys.index_columns ic
                  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                  WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                    AND ic.key_ordinal = 3 AND c.name = N'hora_inicio'
              )
          )
    )
        THROW 50014, 'IX_HorarioFuncionamentoSalao_SalaoDia existe com definicao incompativel.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'IX_HorarioFuncionamentoSalao_SalaoDia'
          AND object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
    )
    BEGIN
        EXEC sys.sp_executesql N'
            CREATE INDEX IX_HorarioFuncionamentoSalao_SalaoDia
                ON dbo.HorarioFuncionamentoSalao (
                    salao_id, dia_semana, hora_inicio
                );';
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
