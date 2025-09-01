import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['spbapp.click']
  },
  define: {
    __API__: JSON.stringify(process.env.VITE_API_URL)
  }
})
