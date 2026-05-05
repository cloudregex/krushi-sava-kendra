import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force reload after toast installation
export default defineConfig({
  plugins: [react()],
})
