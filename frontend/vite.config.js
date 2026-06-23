import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Mọi request /api/* sẽ được forward tới PHP backend
      '/api': {
        target: 'http://localhost/BTLWeb(PC)/backend',
        changeOrigin: true,
        secure: false,
      },
      // Forward ảnh upload (notifications, trainers, blogs mới)
      '/BTLWeb(PC)/backend/uploads': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      // Forward ảnh blog tĩnh cũ (blog-1.jpg → blog-4.jpg)
      '/BTLWeb(PC)/backend/assets': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
