import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward mọi request /api/* tới con Server Ubuntu (Production)
      '/api': {
        target: 'http://192.168.64.16/backend',
        changeOrigin: true,
        secure: false,
      },
      // Forward ảnh upload tới Server Ubuntu
      '/BTLWeb(PC)/backend/uploads': {
        target: 'http://192.168.64.16',
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
