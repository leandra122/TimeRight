USE bd_timeright;
GO

-- =========================
-- MIGRATION: Tabela Avaliacao
-- =========================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Avaliacao' AND xtype='U')
BEGIN
    CREATE TABLE Avaliacao (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id      INT NOT NULL,
        salao_id        INT NOT NULL,
        agendamento_id  INT NOT NULL UNIQUE,
        nota            INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
        comentario      VARCHAR(500) NULL,
        data_avaliacao  DATETIME2 NOT NULL,

        CONSTRAINT FK_Avaliacao_Usuario
            FOREIGN KEY (usuario_id) REFERENCES Usuario(id),

        CONSTRAINT FK_Avaliacao_Salao
            FOREIGN KEY (salao_id) REFERENCES Salao(id),

        CONSTRAINT FK_Avaliacao_Agendamento
            FOREIGN KEY (agendamento_id) REFERENCES Agendamento(id)
    );
END
GO

-- =========================
-- MIGRATION: Coluna observacoes em Agendamento (caso nao exista)
-- =========================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Agendamento' AND COLUMN_NAME = 'observacoes'
)
BEGIN
    ALTER TABLE Agendamento ADD observacoes VARCHAR(255) NULL;
END
GO
