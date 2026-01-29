import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Expose environment variables to the client bundle.
  // We check for both API_KEY and GOOGLE_API_KEY.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.GOOGLE_API_KEY)
  },
  server: {
    port: 8080,
    host: '0.0.0.0'
  },
  preview: {
    port: 8080,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true
  }
});