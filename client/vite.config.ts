import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://158.180.84.232:44445', // 실제 API 서버 주소
        changeOrigin: true, 
        cookieDomainRewrite: 'localhost',
      },
    },
  },
})
