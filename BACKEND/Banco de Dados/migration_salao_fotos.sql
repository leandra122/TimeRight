-- NAO EXECUTADO. Aplicar somente apos autorizacao no banco da aplicacao.
SET XACT_ABORT ON;
IF DB_NAME() <> N'bd_timeright'
    THROW 50001, N'Selecione bd_timeright.', 1;
IF OBJECT_ID(N'dbo.Salao', N'U') IS NULL
    THROW 50002, N'dbo.Salao nao encontrada.', 1;
BEGIN TRY
    BEGIN TRANSACTION;
    IF OBJECT_ID(N'dbo.SalaoFoto', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.SalaoFoto (
            id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SalaoFoto PRIMARY KEY,
            salao_id INT NOT NULL,
            conteudo VARBINARY(MAX) NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            principal BIT NOT NULL CONSTRAINT DF_SalaoFoto_Principal DEFAULT 0,
            CONSTRAINT FK_SalaoFoto_Salao FOREIGN KEY (salao_id) REFERENCES dbo.Salao(id)
        );
    END;
    IF NOT EXISTS (SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.SalaoFoto') AND name = N'UX_SalaoFoto_Principal')
        CREATE UNIQUE INDEX UX_SalaoFoto_Principal ON dbo.SalaoFoto(salao_id) WHERE principal = 1;
    IF NOT EXISTS (SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.SalaoFoto') AND name = N'IX_SalaoFoto_Salao')
        CREATE INDEX IX_SalaoFoto_Salao ON dbo.SalaoFoto(salao_id);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
