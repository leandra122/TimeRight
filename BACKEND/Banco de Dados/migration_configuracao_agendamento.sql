IF COL_LENGTH('dbo.Salao', 'antecedencia_minima_minutos') IS NULL
BEGIN
    ALTER TABLE dbo.Salao ADD antecedencia_minima_minutos INT NULL;
END;
GO

IF COL_LENGTH('dbo.Salao', 'limite_agendamento_dias') IS NULL
BEGIN
    ALTER TABLE dbo.Salao ADD limite_agendamento_dias INT NULL;
END;
GO

UPDATE dbo.Salao
SET antecedencia_minima_minutos = 120
WHERE antecedencia_minima_minutos IS NULL;

UPDATE dbo.Salao
SET limite_agendamento_dias = 60
WHERE limite_agendamento_dias IS NULL;
GO

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Salao')
      AND name = 'antecedencia_minima_minutos'
      AND is_nullable = 1
)
BEGIN
    ALTER TABLE dbo.Salao ALTER COLUMN antecedencia_minima_minutos INT NOT NULL;
END;

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Salao')
      AND name = 'limite_agendamento_dias'
      AND is_nullable = 1
)
BEGIN
    ALTER TABLE dbo.Salao ALTER COLUMN limite_agendamento_dias INT NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.Salao')
      AND parent_column_id = COLUMNPROPERTY(
          OBJECT_ID('dbo.Salao'), 'antecedencia_minima_minutos', 'ColumnId')
)
BEGIN
    ALTER TABLE dbo.Salao ADD CONSTRAINT DF_Salao_AntecedenciaMinimaMinutos
        DEFAULT (120) FOR antecedencia_minima_minutos;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.Salao')
      AND parent_column_id = COLUMNPROPERTY(
          OBJECT_ID('dbo.Salao'), 'limite_agendamento_dias', 'ColumnId')
)
BEGIN
    ALTER TABLE dbo.Salao ADD CONSTRAINT DF_Salao_LimiteAgendamentoDias
        DEFAULT (60) FOR limite_agendamento_dias;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_Salao_AntecedenciaMinimaMinutos'
      AND parent_object_id = OBJECT_ID('dbo.Salao')
)
BEGIN
    ALTER TABLE dbo.Salao WITH CHECK ADD CONSTRAINT CK_Salao_AntecedenciaMinimaMinutos
        CHECK (antecedencia_minima_minutos BETWEEN 0 AND 10080);
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_Salao_LimiteAgendamentoDias'
      AND parent_object_id = OBJECT_ID('dbo.Salao')
)
BEGIN
    ALTER TABLE dbo.Salao WITH CHECK ADD CONSTRAINT CK_Salao_LimiteAgendamentoDias
        CHECK (limite_agendamento_dias BETWEEN 1 AND 365);
END;
GO
