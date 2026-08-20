SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.Agendamento', N'U') IS NULL
BEGIN
    ;THROW 50010, 'Tabela esperada dbo.Agendamento não encontrada.', 1;
END;

IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    ;THROW 50011, 'Tabela esperada dbo.Usuario não encontrada.', 1;
END;

IF OBJECT_ID(N'dbo.NivelAcesso', N'U') IS NULL
BEGIN
    ;THROW 50012, 'Tabela esperada dbo.NivelAcesso não encontrada.', 1;
END;

IF OBJECT_ID(N'dbo.trg_agendamento_user', N'TR') IS NULL
BEGIN
    ;THROW 50013, 'Trigger esperado dbo.trg_agendamento_user não encontrado.', 1;
END;

IF OBJECTPROPERTYEX(OBJECT_ID(N'dbo.trg_agendamento_user', N'TR'), N'ExecIsTriggerDisabled') = 1
BEGIN
    ;THROW 50014, 'Trigger dbo.trg_agendamento_user está desabilitado.', 1;
END;

EXEC sys.sp_executesql N'
ALTER TRIGGER dbo.trg_agendamento_user
ON dbo.Agendamento
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        LEFT JOIN dbo.Usuario AS u ON i.usuario_id = u.id
        LEFT JOIN dbo.NivelAcesso AS n ON u.nivel_acesso_id = n.id
        WHERE u.id IS NULL
           OR n.id IS NULL
           OR UPPER(LTRIM(RTRIM(n.nome))) <> ''USER''
    )
    BEGIN
        ;THROW 50001, ''Apenas usuários do tipo USER podem realizar agendamentos.'', 1;
    END;
END;';
