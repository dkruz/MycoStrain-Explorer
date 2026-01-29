import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // We explicitly define process.env.API_KEY so Vite can replace it during build.
  // This bridges the gap between the server environment and the static browser bundle.
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