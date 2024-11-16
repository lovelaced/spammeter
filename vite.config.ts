import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Example: Split `signingWorker` into its own chunk
          signingWorker: ['./src/components/signingWorker.ts'],
          // Example: Group all vendor libraries into a `vendor` chunk
          vendor: ['@polkadot/api'],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
