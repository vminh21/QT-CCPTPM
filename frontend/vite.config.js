import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Mọi request /api/* sẽ được forward tới container Backend trong Docker
      '/api': {
        target: 'http://backend:80/backend',
        changeOrigin: true,
        secure: false,
      },
      // Forward ảnh upload
      '/BTLWeb(PC)/backend/uploads': {
        target: 'http://backend:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/BTLWeb\(PC\)/, '')
      },
      // Forward ảnh blog tĩnh cũ
      '/BTLWeb(PC)/backend/assets': {
        target: 'http://backend:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/BTLWeb\(PC\)/, '')
      },
    }
  }
})
