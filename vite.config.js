// Configuração do Vite para build e desenvolvimento
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Plugin do React para suporte a JSX
  plugins: [react()],
  // Configurações de build
  build: {
    // Diretório de saída do build
    outDir: 'dist'
  }
})