import { defineConfig } from 'vitest/config'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🎯 Seção de Configuração do Vitest (Adicionada)
  test: {
    globals: true,
    environment: 'jsdom', // <-- Define o ambiente de simulação do DOM
    setupFiles: './src/setupTests.ts', // <-- Recomendado: crie este arquivo para setup comum
  },
})