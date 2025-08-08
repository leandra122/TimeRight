// Configuração do Jest para testes
export default {
  // Ambiente de teste para simular DOM
  testEnvironment: 'jsdom',
  // Arquivo de setup executado após configuração do ambiente
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  // Mapeamento de módulos para arquivos CSS
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Transformação de arquivos JS/JSX com Babel
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};