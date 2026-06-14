import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // onborda is Next.js-flavored — shim its router import so it works in Vite.
      'next/navigation': path.resolve(__dirname, './src/lib/next-navigation-shim.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
