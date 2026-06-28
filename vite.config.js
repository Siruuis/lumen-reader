import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base relative : indispensable pour charger les assets en file:// dans Electron
  base: './',
  // epubjs ships a CommonJS build that needs pre-bundling
  optimizeDeps: {
    include: ['epubjs'],
  },
  server: {
    port: 5180,
    strictPort: true,
    open: false,
  },
})
