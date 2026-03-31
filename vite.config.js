import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/stations': {
        target: 'https://checkfuelprices.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stations/, '/api/widget/stations'),
      },
    },
  },
})
