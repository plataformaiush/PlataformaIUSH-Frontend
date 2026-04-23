import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Config para desarrollo ultra-rápido
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Sin legacy plugin para desarrollo más rápido
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@routes': path.resolve(__dirname, './src/routes'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Sin chunks manuales para builds más rápidos
  },
})
