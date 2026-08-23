SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.HorarioFuncionamentoSalao', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.HorarioFuncionamentoSalao (
        id INT IDENTITY(1,1) NOT NULL,
        salao_id INT NOT NULL,
        dia_semana INT NOT NULL,
        hora_inicio TIME(0) NOT NULL,
        hora_fim TIME(0) NOT NULL,
        CONSTRAINT PK_HorarioFuncionamentoSalao PRIMARY KEY (id)
    );
END;

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_HorarioFuncionamentoSalao_Salao'
      AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
      AND delete_referential_action_desc <> N'CASCADE'
)
BEGIN
    ;THROW 50010,
        'FK_HorarioFuncionamentoSalao_Salao existe sem ON DELETE CASCADE.', 1;
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_HorarioFuncionamentoSalao_Salao'
      AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
)
BEGIN
    ALTER TABLE dbo.HorarioFuncionamentoSalao WITH CHECK
        ADD CONSTRAINT FK_HorarioFuncionamentoSalao_Salao
        FOREIGN KEY (salao_id) REFERENCES dbo.Salao(id) ON DELETE CASCADE;
    ALTER TABLE dbo.HorarioFuncionamentoSalao
        CHECK CONSTRAINT FK_HorarioFuncionamentoSalao_Salao;
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_HorarioFuncionamentoSalao_DiaSemana'
      AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
)
BEGIN
    ALTER TABLE dbo.HorarioFuncionamentoSalao WITH CHECK
        ADD CONSTRAINT CK_HorarioFuncionamentoSalao_DiaSemana
        CHECK (dia_semana BETWEEN 1 AND 7);
    ALTER TABLE dbo.HorarioFuncionamentoSalao
        CHECK CONSTRAINT CK_HorarioFuncionamentoSalao_DiaSemana;
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_HorarioFuncionamentoSalao_Intervalo'
      AND parent_object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
)
BEGIN
    ALTER TABLE dbo.HorarioFuncionamentoSalao WITH CHECK
        ADD CONSTRAINT CK_HorarioFuncionamentoSalao_Intervalo
        CHECK (hora_inicio < hora_fim);
    ALTER TABLE dbo.HorarioFuncionamentoSalao
        CHECK CONSTRAINT CK_HorarioFuncionamentoSalao_Intervalo;
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_HorarioFuncionamentoSalao_Periodo'
      AND object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
)
BEGIN
    CREATE UNIQUE INDEX UX_HorarioFuncionamentoSalao_Periodo
        ON dbo.HorarioFuncionamentoSalao(
            salao_id, dia_semana, hora_inicio, hora_fim);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_HorarioFuncionamentoSalao_SalaoDia'
      AND object_id = OBJECT_ID(N'dbo.HorarioFuncionamentoSalao')
)
BEGIN
    CREATE INDEX IX_HorarioFuncionamentoSalao_SalaoDia
        ON dbo.HorarioFuncionamentoSalao(salao_id, dia_semana, hora_inicio);
END;
