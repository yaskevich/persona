import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3080,
    proxy: {
     '/api': {
       target: 'http://localhost:3081',
       changeOrigin: true,
       secure: false,
       ws: true,
     }
   }
  }
})
