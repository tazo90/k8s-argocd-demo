import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "env.CUSTOM_HEADER": `"${process.env.CUSTOM_HEADER}"`,
  },
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 9000
  }
})
