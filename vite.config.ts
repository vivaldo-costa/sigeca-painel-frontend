import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Em desenvolvimento, /api e encaminhado para a SIGECA API real
      // (Node.js/Express em api.aeca.ao) — a mesma usada pelo Portal.
      '/api': {
        target: 'https://api.aeca.ao',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api.aeca.ao',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
