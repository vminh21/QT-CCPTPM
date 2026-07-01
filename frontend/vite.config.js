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
        target: 'http://168.144.33.103/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Forward ảnh upload tới Server Ubuntu
      '/BTLWeb(PC)/backend/uploads': {
        target: 'http://168.144.33.103',
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
