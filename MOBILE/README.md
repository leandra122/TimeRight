# TimeRight Mobile

MVP do aplicativo de clientes do TimeRight, desenvolvido em JavaScript com React Native e Expo SDK 54. O app usa React Navigation, Axios, SecureStore no Android/iOS e AsyncStorage na web.

## Requisitos

- Node.js 24.19.0 ou compatível;
- npm/npx 11.17.0 ou compatível;
- backend TimeRight disponível na rede;
- Expo Go compatível com SDK 54 para testes em dispositivo.

## Instalação e configuração

No PowerShell, use os executáveis `.cmd` para evitar o bloqueio de scripts `npm.ps1`:

```powershell
cd MOBILE
npm.cmd install
Copy-Item .env.example .env
```

Edite apenas o `.env` local e informe a raiz HTTP do backend, sem barra final:

```text
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8080
```

O `.env` não é versionado. Nenhuma credencial pertence a essa variável. Se ela estiver ausente, o app usa `http://localhost:8080`, útil somente para web/local.

Para descobrir o IPv4 do computador no Windows, execute `ipconfig` e procure o endereço IPv4 do adaptador conectado. Um celular físico não pode usar `localhost`, pois esse nome aponta para o próprio celular. O telefone e o computador devem estar na mesma rede e o backend deve aceitar conexões pela rede local.

## Execução

Inicie o Metro:

```powershell
npx.cmd expo start
```

Abra o projeto no Expo Go lendo o QR code. Para a versão web:

```powershell
npx.cmd expo start --web
```

## Fluxo disponível

- cadastro e login de clientes (`USER`);
- persistência segura da sessão e envio automático do Bearer token;
- catálogo real de salões, serviços e funcionários ativos;
- busca local de salões;
- criação de agendamento com data e horário escolhidos manualmente;
- agenda própria, detalhes e cancelamento lógico;
- perfil público e logout.

O backend ainda não oferece uma grade de horários disponíveis. Por isso, o cliente escolhe data e hora manualmente e o backend valida antecedência, limite e conflitos. Neste MVP, qualquer funcionário ativo do salão pode ser selecionado para qualquer serviço ativo do mesmo salão, porque não existe relação de especialidades no modelo atual.

## Segurança e armazenamento

O token e os dados públicos mínimos da sessão ficam no `expo-secure-store` no Android/iOS. Na web, ficam no AsyncStorage, já que SecureStore não oferece suporte equivalente nesse ambiente. Senhas nunca são persistidas. Respostas `401` encerram a sessão fora do login; respostas `403` preservam a sessão.

## Funcionalidades adiadas

Favoritos, avaliações, promoções, localização, notificações, upload de fotos, OAuth, edição de perfil, troca de senha e bloqueios de agenda não fazem parte deste MVP.
