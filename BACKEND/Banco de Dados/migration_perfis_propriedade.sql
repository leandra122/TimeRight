USE bd_timeright;
GO

IF NOT EXISTS (
    SELECT 1 FROM NivelAcesso WHERE LOWER(nome) = 'employee'
)
BEGIN
    INSERT INTO NivelAcesso (nome, status) VALUES ('employee', 'ATIVO');
END
GO

IF COL_LENGTH('dbo.Salao', 'gerente_id') IS NULL
BEGIN
    ALTER TABLE dbo.Salao ADD gerente_id INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Salao_Gerente'
)
BEGIN
    ALTER TABLE dbo.Salao
        ADD CONSTRAINT FK_Salao_Gerente
        FOREIGN KEY (gerente_id) REFERENCES dbo.Usuario(id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_Salao_GerenteId' AND object_id = OBJECT_ID('dbo.Salao')
)
BEGIN
    CREATE INDEX IX_Salao_GerenteId ON dbo.Salao(gerente_id);
END
GO

IF COL_LENGTH('dbo.Funcionario', 'usuario_id') IS NULL
BEGIN
    ALTER TABLE dbo.Funcionario ADD usuario_id INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Funcionario_Usuario'
)
BEGIN
    ALTER TABLE dbo.Funcionario
        ADD CONSTRAINT FK_Funcionario_Usuario
        FOREIGN KEY (usuario_id) REFERENCES dbo.Usuario(id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Funcionario_UsuarioId' AND object_id = OBJECT_ID('dbo.Funcionario')
)
BEGIN
    CREATE UNIQUE INDEX UX_Funcionario_UsuarioId
        ON dbo.Funcionario(usuario_id)
        WHERE usuario_id IS NOT NULL;
END
GO
