// Configuração do Babel para transformação de código nos testes
module.exports = {
  presets: [
    // Preset para compatibilidade com Node.js atual
    ['@babel/preset-env', { targets: { node: 'current' } }],
    // Preset para transformação de JSX com runtime automático
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};