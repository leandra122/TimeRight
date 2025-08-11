// Script para iniciar o backend automaticamente
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando backend TimeRight...');

const backendPath = path.join(__dirname, 'backend');
const backend = spawn('node', ['server-complete.js'], {
  cwd: backendPath,
  stdio: 'inherit'
});

backend.on('error', (error) => {
  console.error('❌ Erro ao iniciar backend:', error);
});

backend.on('close', (code) => {
  console.log(`Backend encerrado com código ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando backend...');
  backend.kill('SIGINT');
  process.exit(0);
});