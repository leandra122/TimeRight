# Validação de agendamento e localização

Sem Backend, banco ou Google Maps reais: as APIs, o mapa embutido e a abertura de links são simulados.

Na pasta MOBILE:

- Execute `node --test tests/salon-location.test.cjs`.
- Execute `npm run export:web`.
- Com Chrome instalado, execute `node tests/mobile-ux.browser.cjs`. O Playwright deve estar disponível em `PLAYWRIGHT_MODULE` (caminho do módulo) ou na resolução normal do Node. Não é dependência do aplicativo.
- Opcionalmente use `MOBILE_WEB_DIST` para apontar para uma exportação web feita em uma cópia isolada.
- Para conferir o bundle nativo sem dispositivo: `npx expo export --platform ios --output-dir .expo/validation-ios`. Isso não substitui testes no iPhone.

## Homologação em casa

1. Abrir um salão com endereço e localização encontrada: o mapa OpenStreetMap continua visível e o botão Google Maps pesquisa o endereço cadastrado. As coordenadas retornadas são usadas no link somente quando não há endereço suficiente.
2. Abrir um salão com endereço, mas sem coordenadas: o botão pesquisa o endereço cadastrado. Conferir número, cidade e resultado da busca.
3. Conferir endereço legado, localização incompleta, falha de rede e nova tentativa. Não deve surgir um marcador inventado.
4. No iPhone, tocar no botão com Google Maps instalado e sem o aplicativo instalado; verificar a abertura pelo iOS e o retorno ao TimeRight. No navegador, conferir a nova aba.
5. Criar um agendamento: não existe campo de observações; conferir serviço, profissional, data, horário, confirmação e agenda. Cancelar um agendamento de teste e confirmar que o histórico é mantido.
6. Abrir um agendamento antigo com observações: o texto continua disponível nos detalhes e no cartão.

O link usa Google Maps URLs, sem chave de API: https://developers.google.com/maps/documentation/urls/get-started
