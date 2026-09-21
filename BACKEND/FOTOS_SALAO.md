# Fotos do salão — integração pendente no SQL Server

O código está implementado, mas o recurso permanece desativado por padrão.
Não foi executado SQL no banco da escola.

## Ativação, somente após autorização

1. Revisar e aplicar no SSMS `Banco de Dados/migration_salao_fotos.sql`.
   O script cria somente SalaoFoto e seus índices; não altera Salao ou Agendamento.
2. No terminal que inicia o Backend, configurar `SALAO_FOTOS_ENABLED=true`.
3. Reiniciar o Backend nesse terminal quando autorizado.
4. Manter Web e Mobile apontando para o mesmo Backend. No aparelho físico,
   EXPO_PUBLIC_API_URL deve usar o endereço de rede do servidor, não localhost.
   CORS já permite Expo Web em http://localhost:8081, além das origens Web existentes.
5. Testar Gerente → Início → Fotos do salão e, depois, o catálogo Mobile.

Não habilitar a opção antes da migração. Com a opção false, endpoints de fotos
retornam 503 sem consultar a tabela; os fluxos anteriores continuam independentes.

## Regras

- JPEG ou PNG reais, até 5 MB por arquivo e 16 megapixels.
- O Backend decodifica e regrava a imagem; extensão e MIME enviados não bastam.
- De 3 a 10 fotos por salão. No primeiro envio, selecionar pelo menos três.
- A principal faz parte das três fotos mínimas.
- Remover é permitido apenas acima do mínimo; substituir é permitido com três.
- Ao remover a principal, outra foto passa a ser principal.
- Operações do mesmo salão são serializadas pelo bloqueio transacional do salão.
- Bytes e metadados ficam no SQL Server: não dependem de pasta local.
- A cópia de segurança do banco deve incluir SalaoFoto.

## Validação manual após ativação

- Enviar três fotos reais; selecionar uma principal; conferir Web, Expo Web e aplicativo.
- Navegar por Anterior/Próxima e usar Atualizar fotos nos detalhes Mobile.
- Substituir uma imagem; conferir principal e contagem.
- Enviar uma quarta foto e remover a principal; conferir escolha automática de outra.
- Com três fotos, tentar remover: a interface bloqueia e a API também rejeita.
- Tentar arquivo falso, formato diferente e arquivo maior que 5 MB.
- Outro Gerente não deve listar o salão na gestão nem alterar suas fotos pela API.
- Reiniciar o Backend (após autorização) e conferir que as imagens permanecem.
- Conferir cadastro, endereço e agendamento como regressão.

A persistência foi implementada, mas o teste de reinício no SQL Server real depende
da aplicação autorizada da migração e da ativação.
