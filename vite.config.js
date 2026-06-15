import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativo: funciona en GitHub Pages (subcarpeta /repo/) sin tocar nada
export default defineConfig({
  plugins: [react()],
  base: './',
})
