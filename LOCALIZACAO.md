# Localização dos salões

## Implementação

`GET /saloes/{id}/localizacao` busca o salão cadastrado e consulta o Nominatim exclusivamente no backend. Não aceita um endereço arbitrário enviado pelo cliente. A requisição é separada dos detalhes, serviços e agendamentos.

O endereço usa logradouro, número, bairro, cidade, UF e CEP cadastrados. Rua, número, cidade e UF são obrigatórios para tentar localizar. Cadastros antigos apenas com endereço livre precisam ser completados no painel do gerente; não há coordenadas padrão nem tentativa de adivinhar a cidade. Complemento e ponto de referência não são enviados ao provedor.

Estados: `FOUND`, `INCOMPLETE`, `NOT_FOUND` e `UNAVAILABLE`. Somente `FOUND` tem coordenadas. O endereço devolvido pelo provedor aparece para conferência, com indicação de localização aproximada. O mapa e o link usam o mesmo ponto.

## Cache e limites

- Cache em memória por endereço normalizado, compartilhado entre salões com o mesmo endereço.
- Sucesso: 7 dias; não encontrado: 1 hora; falha: 1 minuto.
- Até 2.000 entradas, removendo a menos recentemente usada quando cheio. Reiniciar o backend limpa o cache.
- Consultas concorrentes são serializadas, com nova verificação do cache. O provedor só recebe outra consulta pelo menos 1 segundo após a conclusão da anterior.
- Conexão: timeout de 3 segundos; requisição: 5 segundos; espera pela fila: até 7 segundos. O cliente espera até 15 segundos.
- Falhas abrem uma pausa global de 1 minuto, evitando insistir no provedor indisponível. Não há retentativa automática.
- Endereço salvo diferente gera outra chave; não é necessário migrar ou gravar coordenadas no banco.

**Esta versão exige uma única instância responsável pela geocodificação.** Para múltiplas réplicas, centralizar essa camada ou compartilhar cache e limitador antes de escalar. O limite do Nominatim vale para a aplicação inteira.

Configuração opcional do backend: `app.geocoding.url` (ou `APP_GEOCODING_URL`) substitui o endpoint; `app.geocoding.user-agent` (ou `APP_GEOCODING_USER_AGENT`) personaliza a identificação TimeRight com contato da implantação. Não exige chave ou pagamento.

Uso sujeito à [política do Nominatim](https://operations.osmfoundation.org/policies/nominatim/): máximo de 1 consulta por segundo por aplicação, identificação, atribuição e cache; sem autocomplete ou consultas em massa. O serviço público pode ficar indisponível e a cobertura dos endereços varia. Os mapas dependem de acesso ao OpenStreetMap.

## Teste manual

1. Inicie o backend com Java 17 (`.\mvnw.cmd spring-boot:run`), o Web (`npm run dev` em FRONTEND) e o Expo Web (`npm run web` em MOBILE). Configure os endereços da API conforme os READMEs existentes. CORS local inclui as portas 3000, 5173 e 8081; outros hosts exigem configuração explícita.
2. Entre como gerente em `/manager`. Selecione dois salões com endereços reais diferentes e completos. Confira nome, endereço encontrado, marcador e link de cada um.
3. Em “Editar endereço”, altere e salve um endereço real. O mapa deve recarregar após salvar. Volte ao outro salão e confirme que ele não foi alterado.
4. Remova a cidade de um cadastro de teste e salve: deve aparecer “Endereço incompleto”, sem marcador. Restaure o endereço depois.
5. Para não encontrado e indisponibilidade, prefira os testes simulados abaixo. Para simular indisponibilidade manual, inicie um backend de desenvolvimento com `APP_GEOCODING_URL=http://127.0.0.1:9/search`. Os detalhes devem continuar acessíveis e o mapa deve informar indisponibilidade. Reinicie sem essa variável para restaurar.
6. No Expo Web, entre como cliente e abra os dois salões. Confira o endereço encontrado e “Abrir no mapa”. Teste largura de 390 px e desktop. No Android/iOS, abra a mesma tela no Expo e confira o mapa dentro da WebView.
7. No Network do navegador, a localização deve chamar somente `/saloes/{id}/localizacao` no backend. O iframe acessa o OpenStreetMap para exibição, sem consulta direta ao Nominatim.

## Validação automatizada

- Backend: `.\mvnw.cmd "-Dtest=GeocodingServiceTest,NominatimGatewayTest,LocalizacaoIntegrationTest" test`.
- Web: `npm run build` em FRONTEND.
- Expo Web: `npm run export:web` em MOBILE.
- Android: `npm run export:android -- --output-dir <pasta-temporaria>` em MOBILE; exportação não substitui teste em aparelho.
- Navegador: `node tests/location-browser.cjs` após os dois builds Web. Requer Chrome e Playwright; `PLAYWRIGHT_MODULE` pode apontar para uma instalação temporária, sem dependência adicional de produção. Usa fixtures, sem banco ou consultas públicas. Confere dois salões, links, largura responsiva, edição no gerente, estados de falha e ausência de chamadas diretas ao Nominatim.

Nenhuma migração, commit ou push faz parte desta implementação. O backup MOBILE_backup_sdk54 foi preservado.

## Resultados desta execução

- Os 7 testes específicos de localização passaram, incluindo endpoint público, CORS do Expo Web e detalhes acessíveis durante indisponibilidade.
- Build Vite, exportação Expo Web e exportação Android passaram.
- Chrome headless: Web e Expo Web passaram nos cenários do script, com respostas simuladas. Não foi feita consulta ao Nominatim público nem validação em aparelho físico.
- Suíte completa executada antes da inclusão do último teste HTTP: 160 testes, 157 aprovados e 3 falhas. As mesmas 3 falhas foram reproduzidas em uma cópia temporária do HEAD anterior às alterações: `SecurityMatrixIntegrationTest.cadastroClienteECatalogoDeFuncionariosSaoPublicos`, `ClienteAgendamentoConcurrencyIntegrationTest.duasRequisicoesConcorrentesCriamApenasUmaReserva` e `HorarioFuncionamentoSalaoIntegrationTest.catalogosPublicosContinuamLivresERotasAntigasDeEscritaContinuamBloqueadas`. Os módulos correspondentes foram preservados.

## Arquivos adicionados ou alterados

- Backend, sob `BACKEND/src/main/java/com/timeright/tcc/`: `config/SecurityConfig.java`, `controller/LocalizacaoController.java`, `dto/LocalizacaoResponse.java`, `integration/GeocodingGateway.java`, `integration/NominatimGateway.java`, `services/GeocodingService.java`.
- Testes, sob `BACKEND/src/test/java/com/timeright/tcc/`: `controller/LocalizacaoIntegrationTest.java`, `integration/NominatimGatewayTest.java`, `services/GeocodingServiceTest.java`.
- Web: `FRONTEND/src/components/LocalizacaoSalao.jsx`, `FRONTEND/src/pages/DashboardAdmin.jsx`.
- Mobile: `MOBILE/src/components/SalonLocation.js`, `MOBILE/src/components/LocationMap.js`, `MOBILE/src/components/LocationMap.web.js`, `MOBILE/src/screens/SalonDetailsScreen.js`, `MOBILE/package.json`, `MOBILE/package-lock.json`.
- Documentação e teste de navegador: `LOCALIZACAO.md`, `tests/location-browser.cjs`.
