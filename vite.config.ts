import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // We remove the hard-coded 'define' for API_KEY to allow runtime discovery 
  // of the key if it's injected by the hosting platform (e.g. AI Studio).
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